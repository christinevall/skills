/**
 * build-tokens.mjs: turns tokens/tokens.json into the files the code uses.
 *
 *   node scripts/build-tokens.mjs [--tokens tokens/tokens.json] [--css src/styles/tokens.css] [--json src/tokens/tokens.resolved.json]
 *
 * In:   tokens.json (the one source, W3C DTCG format). The CSS prefix comes
 *       from "$extensions": { "systemify": { "prefix": "ds" } } at the root.
 * Out:  tokens.css            (CSS variables + one media query per breakpoint mode)
 *       tokens.resolved.json  (every token, resolved per mode, for docs and checks)
 *
 * A small readable script instead of Style Dictionary. It does four things:
 *   1. Walk the file and collect every token (a node with a $value).
 *   2. Resolve aliases like {primitive.font.size.48}.
 *   3. Name it: drop the tier, join with "-", prefix "--<prefix>-".
 *   4. Write CSS: base values (Mobile) in :root, then a media query for
 *      Tablet and one for Desktop with only the variables that change.
 *      Text styles become one `font` shorthand plus their parts.
 *
 * Values: plain strings ("#0066cc", "1.5rem") or the DTCG 2025.10 objects
 * ({ colorSpace, components, hex } for colour, { value, unit } for dimension).
 * Both work; objects are what the stable spec asks for.
 *
 * Modes and breakpoints: a token with $extensions.systemify.modes { tablet, desktop }
 * (or the older $extensions.cvds.modes) changes per breakpoint. The breakpoints themselves are tokens
 * (primitive.breakpoint.*), so the media queries are generated, never typed.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return resolve(root, i > -1 ? process.argv[i + 1] : fallback);
};
const TOKENS = arg('tokens', 'tokens/tokens.json');
const CSS_OUT = arg('css', 'src/styles/tokens.css');
const JSON_OUT = arg('json', 'src/tokens/tokens.resolved.json');
const source = JSON.parse(readFileSync(TOKENS, 'utf8'));

const PREFIX = source.$extensions?.systemify?.prefix ?? 'ds';
const MODES = ['tablet', 'desktop'];

// ---------------------------------------------------------------- 1. collect
const tokens = new Map();
function walk(node, path, inheritedType) {
  const type = node.$type ?? inheritedType;
  if ('$value' in node) {
    tokens.set(path.join('.'), {
      path,
      tier: path[0],
      type,
      value: node.$value,
      description: node.$description,
      modes: node.$extensions?.systemify?.modes ?? node.$extensions?.cvds?.modes ?? {},
    });
    return;
  }
  for (const [key, child] of Object.entries(node)) {
    if (!key.startsWith('$')) walk(child, [...path, key], type);
  }
}
for (const tier of ['primitive', 'semantic', 'component']) if (source[tier]) walk(source[tier], [tier], undefined);

// ---------------------------------------------------------------- 2. resolve
const ALIAS = /^\{([^}]+)\}$/;
const isAlias = (v) => typeof v === 'string' && ALIAS.test(v);
const target = (v) => v.match(ALIAS)[1];

/** Follows an alias chain to the raw value, in a given mode. */
function resolveValue(value, mode = 'mobile', seen = []) {
  if (isAlias(value)) {
    const key = target(value);
    if (seen.includes(key)) throw new Error(`Circular alias: ${[...seen, key].join(' -> ')}`);
    const t = tokens.get(key);
    if (!t) throw new Error(`Broken alias {${key}} (from ${seen.at(-1) ?? 'a token'})`);
    return resolveValue(valueIn(t, mode), mode, [...seen, key]);
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveValue(v, mode, seen)]));
  }
  return value;
}
/** A token's own value in a mode (falls back to the base value). */
const valueIn = (t, mode) => (mode !== 'mobile' && t.modes[mode] !== undefined ? t.modes[mode] : t.value);

// ---------------------------------------------------------------- 3. name
const cssName = (path) => `--${PREFIX}-${path.slice(1).join('-')}`;
const varOf = (alias) => `var(${cssName(target(alias).split('.'))})`;

const names = new Map();
for (const [key, t] of tokens) {
  const n = cssName(t.path);
  if (names.has(n)) throw new Error(`Name clash: ${key} and ${names.get(n)} both become ${n}`);
  names.set(n, key);
}

// ---------------------------------------------------------------- 4. format
const format = (type, v) => {
  // DTCG 2025.10 value objects
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    if ('unit' in v && 'value' in v) return `${v.value}${v.unit}`;
    if ('colorSpace' in v) {
      if (v.hex) return v.alpha !== undefined && v.alpha < 1 ? `color-mix(in srgb, ${v.hex} ${v.alpha * 100}%, transparent)` : v.hex;
      return `color(${v.colorSpace} ${v.components.join(' ')}${v.alpha !== undefined ? ` / ${v.alpha}` : ''})`;
    }
  }
  if (type === 'fontFamily') return (Array.isArray(v) ? v : [v]).map((f) => (/\s/.test(f) ? `"${f}"` : f)).join(', ');
  if (type === 'cubicBezier') return `cubic-bezier(${v.join(', ')})`;
  return String(v);
};
/** CSS text for a value: var() for an alias (keeps the chain visible in the inspector), else the raw value. */
const css = (type, v) => (isAlias(v) ? varOf(v) : format(type, v));

const base = { primitive: [], semantic: [], component: [] };
const perMode = { tablet: [], desktop: [] };
const resolved = [];

const PART_TYPES = { fontFamily: 'fontFamily', fontWeight: 'fontWeight', fontStyle: 'string', lineHeight: 'number', fontSize: 'dimension', letterSpacing: 'dimension' };
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

for (const [key, t] of tokens) {
  const name = cssName(t.path);

  if (t.type === 'typography') {
    // A text style: one variable per part, plus a `font` shorthand so a
    // component applies the whole style in one line. The parts point at the
    // responsive typography variables, so the style follows the breakpoint.
    const parts = {};
    for (const [prop, raw] of Object.entries(t.value)) {
      parts[kebab(prop)] = css(PART_TYPES[prop], raw);
      base[t.tier].push(`${name}-${kebab(prop)}: ${parts[kebab(prop)]};`);
    }
    const style = parts['font-style'] ? `var(${name}-font-style) ` : '';
    base[t.tier].push(`${name}: ${style}var(${name}-font-weight) var(${name}-font-size)/var(${name}-line-height) var(${name}-font-family);`);
    resolved.push({
      key, cssVar: name, tier: t.tier, type: t.type, description: t.description, css: parts,
      value: { mobile: resolveValue(t.value, 'mobile'), tablet: resolveValue(t.value, 'tablet'), desktop: resolveValue(t.value, 'desktop') },
    });
    continue;
  }

  base[t.tier].push(`${name}: ${css(t.type, t.value)};`);
  for (const mode of MODES) {
    if (t.modes[mode] !== undefined) perMode[mode].push(`${name}: ${css(t.type, t.modes[mode])};`);
  }
  const modeValues = Object.fromEntries(['mobile', ...MODES].map((m) => [m, format(t.type, resolveValue(valueIn(t, m), m))]));
  resolved.push({
    key, cssVar: name, tier: t.tier, type: t.type, description: t.description,
    alias: isAlias(t.value) ? target(t.value) : null,
    value: modeValues.mobile,
    responsive: Object.keys(t.modes).length ? modeValues : null,
    modeAliases: Object.keys(t.modes).length ? Object.fromEntries(Object.entries(t.modes).map(([m, v]) => [m, isAlias(v) ? target(v) : null])) : null,
  });
}

const bp = (mode) => (tokens.has(`primitive.breakpoint.${mode}`) ? format('dimension', resolveValue(`{primitive.breakpoint.${mode}}`)) : null);
const indent = (lines, n = 4) => lines.map((l) => ' '.repeat(n) + l).join('\n');

const out = `/*
 * GENERATED by scripts/build-tokens.mjs from tokens/tokens.json.
 * Do not edit by hand: change tokens.json and run \`npm run tokens\`.
 *
 * Mobile values first. The two media queries below are the Tablet and
 * Desktop modes: they only redefine the variables that change. Every text
 * style, the grid and the section spacing follow automatically.
 */
@layer tokens {
  :root {
${[
    ['Tier 1 · primitives: raw values, never used by components', base.primitive],
    ['Tier 2 · semantic: what a value is for', base.semantic],
    ['Tier 3 · component: one component\'s own knobs', base.component],
  ].filter(([, lines]) => lines.length).map(([title, lines]) => `    /* ---- ${title} ---- */\n${indent(lines)}`).join('\n\n')}
  }

${MODES.filter((m) => bp(m) && perMode[m].length).map((m) => `
  /* ---- Mode: ${m[0].toUpperCase() + m.slice(1)} (from ${bp(m)}) ---- */
  @media (min-width: ${bp(m)}) {
    :root {
${indent(perMode[m], 6)}
    }
  }`).join('\n')}
}
`;

mkdirSync(dirname(CSS_OUT), { recursive: true });
mkdirSync(dirname(JSON_OUT), { recursive: true });
writeFileSync(CSS_OUT, out);
writeFileSync(JSON_OUT, JSON.stringify(resolved, null, 2) + '\n');

const count = (tier) => resolved.filter((t) => t.tier === tier).length;
const responsiveCount = resolved.filter((t) => t.responsive).length;
console.log(`tokens: ${resolved.length} (${count('primitive')} primitive · ${count('semantic')} semantic · ${count('component')} component), ${responsiveCount} responsive -> ${CSS_OUT}`);
