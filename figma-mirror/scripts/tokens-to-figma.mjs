/**
 * tokens/*.json → the Figma variables and styles that mirror them.
 *
 * The one place the token → Figma mapping lives. The figma-mirror skill uses
 * the payload to create or update the library, and scripts/validate.mjs
 * imports buildPayload() to check figma/manifest.json against it, so the two
 * cannot disagree about what Figma should contain.
 *
 *   node scripts/figma/tokens-to-figma.mjs             the payload, as JSON
 *   node scripts/figma/tokens-to-figma.mjs --summary   counts only
 *
 * Naming rule: a Figma name is the token path with "." replaced by "/", and
 * its WEB code syntax is the real CSS variable, var(--<prefix>-<path joined by ->).
 * Paths, prefix and fonts come from ./config.mjs.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CONFIG } from './config.mjs';

const ROOT = process.cwd(); // the project root: run from there (npm run …)
const P = CONFIG.prefix;
const read = (p) => JSON.parse(readFileSync(join(ROOT, CONFIG.tokens.dir, p), 'utf8'));

/** The family Figma uses for each font token: the first family the code names. */
export const FIGMA_FONTS = CONFIG.figmaFonts;
const STYLE_BY_WEIGHT = {
  sans: { 400: 'Regular', 500: 'Medium', 600: 'Semi Bold', 700: 'Bold' },
  mono: { 400: 'Regular', 500: 'Medium', 600: 'SemiBold', 700: 'Bold' },
};

function leaves(node, path = [], type) {
  const out = [];
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$') || !v || typeof v !== 'object') continue;
    const t = v.$type ?? node.$type ?? type;
    if ('$value' in v) out.push({ path: [...path, k], value: v.$value, type: t, description: v.$description });
    else out.push(...leaves(v, [...path, k], t));
  }
  return out;
}

const figmaName = (p) => p.join('/');
const codeSyntax = (p) => `var(--${P}-${p.join('-')})`;
const refPath = (v) => String(v).match(/^\{([^}]+)\}$/)?.[1].split('.') ?? null;
const r2 = (n) => Math.round(n * 100) / 100;
const px = (v) => {
  v = String(v).trim();
  if (v === '0') return 0;
  if (v.endsWith('rem')) return parseFloat(v) * 16;
  if (v.endsWith('px')) return parseFloat(v);
  throw new Error(`tokens-to-figma: unsupported unit in ${v}`);
};
const hex = (h) => {
  const c = h.slice(1);
  return { r: parseInt(c.slice(0, 2), 16) / 255, g: parseInt(c.slice(2, 4), 16) / 255, b: parseInt(c.slice(4, 6), 16) / 255, a: 1 };
};
const rgba = (v) => {
  const m = String(v).match(/rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)/);
  if (!m) throw new Error(`tokens-to-figma: unsupported colour ${v}`);
  return { r: m[1] / 255, g: m[2] / 255, b: m[3] / 255, a: +m[4] };
};

/** Every token, with its CSS variable and value. Used by css-to-spec for values Figma cannot bind. */
export function allTokens() {
  const tier1 = readTier1();
  return [
    ...leaves(tier1),
    ...leaves(read(CONFIG.tokens.light)),
    ...leaves(read(CONFIG.tokens.textStyles)),
  ].map((t) => ({ ...t, css: `--${P}-${t.path.join('-')}` }));
}

function readTier1() {
  const dir = join(ROOT, CONFIG.tokens.dir, CONFIG.tokens.definitions);
  return Object.assign({}, ...readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => read(`${CONFIG.tokens.definitions}/${f}`)));
}

export function buildPayload() {
  const tier1 = readTier1();
  const get = (p) => p.reduce((n, k) => n?.[k], tier1)?.$value;
  const light = read(CONFIG.tokens.light);
  const dark = read(CONFIG.tokens.dark);
  const styles = read(CONFIG.tokens.textStyles).typography;

  const variables = [];
  const add = (collection, path, type, scopes, values, extra = {}) =>
    variables.push({ collection, name: figmaName(path), type, scopes, web: codeSyntax(path), values, ...extra });

  // Color Primitives — tier 1. Hidden from pickers: semantics alias into them.
  for (const t of leaves({ color: tier1.color })) add('Color Primitives', t.path, 'COLOR', [], { Value: hex(t.value) });

  // Color — tier 2, Light and Dark, aliased into the primitives.
  const SCOPES = {
    background: ['FRAME_FILL', 'SHAPE_FILL'],
    content: ['TEXT_FILL', 'SHAPE_FILL', 'STROKE_COLOR'], // text and icons
    border: ['STROKE_COLOR', 'SHAPE_FILL'], // strokes, and dividers drawn as shapes
  };
  const colourValue = (v) => (refPath(v) ? { alias: figmaName(refPath(v)) } : { raw: rgba(v) });
  const darkByName = new Map(leaves({ color: dark.color }).map((t) => [figmaName(t.path), t]));
  for (const t of leaves({ color: light.color })) {
    const d = darkByName.get(figmaName(t.path));
    if (!d) throw new Error(`tokens-to-figma: ${figmaName(t.path)} has no dark value`);
    if (!SCOPES[t.path[1]]) throw new Error(`tokens-to-figma: no scopes for colour category "${t.path[1]}"`);
    add('Color', t.path, 'COLOR', SCOPES[t.path[1]], { Light: colourValue(t.value), Dark: colourValue(d.value) },
      t.description ? { description: t.description } : {});
  }

  // Elevation. A shadow is composite, so it becomes an effect style whose
  // colour is a Light/Dark variable. Figma-only: no CSS variable holds a
  // shadow's colour alone, so those variables carry no code syntax.
  const shadow = (v) => {
    const s = refPath(v) ? get(refPath(v)) : v;
    const m = String(s).match(/^(-?[\d.]+)(?:px)?\s+(-?[\d.]+)(?:px)?\s+([\d.]+)(?:px)?(?:\s+(-?[\d.]+)(?:px)?)?\s+(rgb\(.+\))$/);
    if (!m) throw new Error(`tokens-to-figma: unsupported shadow ${s}`);
    return { x: +m[1], y: +m[2], blur: +m[3], spread: +(m[4] ?? 0), color: rgba(m[5]) };
  };
  const effectStyles = [];
  for (const t of leaves({ elevation: light.elevation })) {
    const level = t.path[1];
    const L = shadow(t.value);
    const D = shadow(dark.elevation[level].$value);
    variables.push({
      collection: 'Color', name: `elevation/${level}/color`, type: 'COLOR', scopes: ['EFFECT_COLOR'], web: null,
      values: { Light: { raw: L.color }, Dark: { raw: D.color } },
      description: `Shadow colour for the elevation/${level} effect style, so the shadow follows Light/Dark. Figma-only: code expresses the whole shadow as one token, ${codeSyntax(t.path)}.`,
    });
    effectStyles.push({
      name: `elevation/${level}`, x: L.x, y: L.y, blur: L.blur, spread: L.spread, color: `elevation/${level}/color`,
      web: codeSyntax(t.path), geometryDiffersInDark: L.x !== D.x || L.y !== D.y || L.blur !== D.blur || L.spread !== D.spread,
    });
  }

  // Size
  for (const t of leaves({ space: tier1.space })) add('Size', t.path, 'FLOAT', ['GAP'], { Value: px(t.value) });
  for (const t of leaves({ radius: tier1.radius })) add('Size', t.path, 'FLOAT', ['CORNER_RADIUS'], { Value: px(t.value) });
  for (const t of leaves({ breakpoint: tier1.breakpoint })) {
    add('Size', t.path, 'FLOAT', ['WIDTH_HEIGHT'], { Value: px(t.value) }, t.description ? { description: t.description } : {});
  }

  // Typography — the scale, then one composite per text style. Line height and
  // letter spacing hold resolved pixels: Figma reads those variables as pixels,
  // and the code values are relative (a multiplier and em).
  for (const t of leaves({ font: { size: tier1.font.size } })) add('Typography', t.path, 'FLOAT', ['FONT_SIZE'], { Value: px(t.value) });
  for (const t of leaves({ font: { weight: tier1.font.weight } })) add('Typography', t.path, 'FLOAT', ['FONT_WEIGHT'], { Value: Number(t.value) });
  for (const family of ['sans', 'mono']) {
    add('Typography', ['font', family], 'STRING', ['FONT_FAMILY'], { Value: FIGMA_FONTS[family] }, {
      description: tier1.font[family].$value.replace(/"/g, '').startsWith(FIGMA_FONTS[family])
        ? `${FIGMA_FONTS[family]}, as in code: ${tier1.font[family].$value}.`
        : `Code value is a system font stack: ${tier1.font[family].$value}. Figma needs one real family, so ${FIGMA_FONTS[family]} stands in.`,
    });
  }
  const textStyles = [];
  for (const [style, def] of Object.entries(styles)) {
    const ref = (prop) => refPath(def[prop].$value);
    const value = (prop) => (ref(prop) ? get(ref(prop)) : def[prop].$value);
    const family = ref('font-family')[1];
    const size = px(value('font-size'));
    const weight = Number(value('font-weight'));
    const lineHeight = Number(value('line-height'));
    const letterSpacing = parseFloat(value('letter-spacing')) || 0;
    const base = ['typography', style];
    const alias = (prop) => ({ Value: { alias: figmaName(ref(prop)) } });
    add('Typography', [...base, 'font-family'], 'STRING', ['FONT_FAMILY'], alias('font-family'));
    add('Typography', [...base, 'font-size'], 'FLOAT', ['FONT_SIZE'], alias('font-size'));
    add('Typography', [...base, 'font-weight'], 'FLOAT', ['FONT_WEIGHT'], alias('font-weight'));
    add('Typography', [...base, 'line-height'], 'FLOAT', ['LINE_HEIGHT'], { Value: r2(size * lineHeight) }, {
      description: `${r2(size * lineHeight)}px = ${size}px × ${lineHeight}. Code uses the unitless ${lineHeight}; Figma reads a line-height variable as pixels.`,
    });
    add('Typography', [...base, 'letter-spacing'], 'FLOAT', ['LETTER_SPACING'], { Value: r2(size * letterSpacing) }, {
      description: `${r2(size * letterSpacing)}px = ${size}px × ${letterSpacing}em. Figma reads a letter-spacing variable as pixels.`,
    });
    textStyles.push({
      name: figmaName(base),
      family: FIGMA_FONTS[family],
      style: STYLE_BY_WEIGHT[family][weight],
      textCase: value('text-transform') === 'uppercase' ? 'UPPER' : 'ORIGINAL',
      description: `${def.$description ?? ''} CSS: var(--${P}-typography-${style}-*).`.trim(),
      bind: Object.fromEntries(
        [['fontFamily', 'font-family'], ['fontSize', 'font-size'], ['fontWeight', 'font-weight'], ['lineHeight', 'line-height'], ['letterSpacing', 'letter-spacing']]
          .map(([field, prop]) => [field, figmaName([...base, prop])]),
      ),
    });
  }

  // Motion. TIMING and EASING variables have no scope list in Figma; they can
  // only ever fill a timing or easing field, so there is nothing to narrow.
  for (const t of leaves({ duration: tier1.duration })) add('Motion', t.path, 'TIMING', null, { Value: parseFloat(t.value) / 1000 });
  for (const t of leaves({ easing: tier1.easing })) {
    const [x1, y1, x2, y2] = String(t.value).match(/cubic-bezier\(([^)]+)\)/)[1].split(',').map(Number);
    add('Motion', t.path, 'EASING', null, { Value: { type: 'CUSTOM_CUBIC_BEZIER', easingFunctionCubicBezier: { x1, y1, x2, y2 } } });
  }

  return {
    collections: { 'Color Primitives': ['Value'], Color: ['Light', 'Dark'], Size: ['Value'], Typography: ['Value'], Motion: ['Value'] },
    variables,
    textStyles,
    effectStyles,
  };
}

// Run as a command, not when imported (validate imports it; so can `node -e`, where argv[1] is empty).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const payload = buildPayload();
  if (process.argv.includes('--summary')) {
    const byCollection = {};
    for (const v of payload.variables) byCollection[v.collection] = (byCollection[v.collection] ?? 0) + 1;
    console.log({ variables: byCollection, total: payload.variables.length, textStyles: payload.textStyles.length, effectStyles: payload.effectStyles.length });
  } else {
    process.stdout.write(JSON.stringify(payload, null, 1) + '\n');
  }
}
