/**
 * A component's stylesheet → the Figma bindings it needs.
 *
 * Maps every declaration in src/components/<Name>/<Name>.module.css through the
 * naming contract: var(--<prefix>-…) becomes the Figma variable, text style or
 * effect style with that code syntax. Nothing is transcribed by hand.
 *
 *   node scripts/figma/css-to-spec.mjs Button            readable
 *   node scripts/figma/css-to-spec.mjs Button --json     for a build script
 *
 * It also lists what cannot be mirrored as-is, so each gap is decided on
 * purpose instead of discovered later: raw values (mirrored raw), values Base
 * UI computes in the browser, sibling and child selectors, pseudo-elements,
 * and at-rules such as animations.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildPayload, allTokens } from './tokens-to-figma.mjs';
import { CONFIG } from './config.mjs';

const ROOT = process.cwd(); // the project root: run from there (npm run …)
const P = CONFIG.prefix;

/**
 * Base UI exposes state as data attributes. State a consumer chooses through a
 * prop becomes a Figma variant property, named after the prop. State the
 * browser produces on its own — animation phases, placement, gestures — does
 * not: a designer cannot pick it, so a variant for it would be a lie.
 */
export const STATE_ATTRS = new Set([
  'disabled', 'checked', 'unchecked', 'indeterminate', 'invalid', 'pressed', 'selected', 'highlighted',
  'orientation', 'popup-open', 'panel-open', 'open', 'active', 'placeholder', 'type', 'readonly', 'required', 'complete',
]);
export const RUNTIME_ATTRS = new Set([
  'starting-style', 'ending-style', 'instant', 'swiping', 'scrolling', 'dragging', 'activation-direction',
  'side', 'align', 'direction', 'limited', 'hovering', 'touched', 'dirty', 'focused', 'expanded', 'filled',
]);

const TEXT_PROP = new RegExp(`^--${P}-typography-([a-z0-9-]+?)-(font-family|font-size|font-weight|line-height|letter-spacing|text-transform)$`);

export function specFor(component) {
  const file = join(ROOT, CONFIG.components, component, `${component}.module.css`);
  if (!existsSync(file)) throw new Error(`css-to-spec: ${file} not found`);

  const contract = new Map();
  const payload = buildPayload();
  for (const v of payload.variables) if (v.web) contract.set(v.web.slice(4, -1), { variable: v.name });
  for (const s of payload.effectStyles) contract.set(s.web.slice(4, -1), { effectStyle: s.name });
  const values = new Map(allTokens().map((t) => [t.css, t.value]));

  let css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const atRules = [];
  css = css.replace(/@(keyframes|media|supports)([^{]*)\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, (_, kind, what) => {
    atRules.push(`@${kind}${what.trimEnd()}`);
    return '';
  });

  const mapValue = (value) => {
    // A computed value is raw as a whole, whatever tokens it uses:
    // Dialog's width is min(28rem, calc(100vw - var(--<prefix>-space-8))), not space/8.
    if (/\b(?:min|max|calc|clamp)\(/.test(value)) return [{ raw: value }];
    const refs = [...value.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]);
    if (!refs.length) return [{ raw: value }];
    return refs.map((ref) => {
      if (!ref.startsWith(`--${P}-`)) return { runtime: ref };
      const text = ref.match(TEXT_PROP);
      if (text) return { textStyle: `typography/${text[1]}` };
      return contract.get(ref) ?? (values.has(ref) ? { valueOnly: values.get(ref), css: ref } : { undefined: ref });
    });
  };

  const gaps = { raw: [], runtime: new Set(), combinators: [], pseudoElements: [], atRules, reviewStates: new Set() };
  const rules = [];
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim().replace(/\s+/g, ' ');
    const states = [...selector.matchAll(/\[data-([a-z-]+)/g)].map((s) => s[1]);
    for (const s of states) if (!STATE_ATTRS.has(s) && !RUNTIME_ATTRS.has(s)) gaps.reviewStates.add(s);
    if (/\s[+~>]\s/.test(selector)) gaps.combinators.push(selector);
    if (selector.includes('::')) gaps.pseudoElements.push(selector);

    const decls = [];
    let textStyle = null;
    for (const d of m[2].split(';').map((x) => x.trim()).filter(Boolean)) {
      const i = d.indexOf(':');
      const prop = d.slice(0, i).trim();
      const value = d.slice(i + 1).trim().replace(/\s+/g, ' ');
      const map = mapValue(value);
      if (map.every((x) => x.textStyle)) { textStyle = map[0].textStyle; continue; } // six declarations, one style
      for (const x of map) {
        if (x.raw !== undefined) gaps.raw.push(`${selector} { ${prop}: ${x.raw} }`);
        if (x.runtime) gaps.runtime.add(x.runtime);
      }
      decls.push({ prop, value, map });
    }
    rules.push({
      selector,
      states: states.map((s) => ({ attr: s, kind: STATE_ATTRS.has(s) ? 'variant' : RUNTIME_ATTRS.has(s) ? 'runtime' : 'review' })),
      interaction: [...selector.matchAll(/:(hover|active|focus-visible|focus)\b/g)].map((x) => x[1]),
      textStyle,
      decls,
    });
  }
  return { component, file: `${CONFIG.components}/${component}/${component}.module.css`, rules,
    gaps: { ...gaps, runtime: [...gaps.runtime], reviewStates: [...gaps.reviewStates] } };
}

const LAYOUT_ONLY = new Set(['display', 'align-items', 'justify-content', 'flex-direction', 'flex-wrap', 'cursor', 'white-space',
  'transition', 'transition-property', 'transition-duration', 'transition-timing-function', 'user-select', 'appearance', 'outline-offset']);
const show = (x) =>
  x.variable ?? (x.effectStyle && `effect ${x.effectStyle}`) ?? (x.textStyle && `text ${x.textStyle}`) ??
  (x.valueOnly !== undefined ? `≈${x.valueOnly} (value only)` : x.runtime ? `RUNTIME ${x.runtime}` : x.undefined ? `!! undefined ${x.undefined}` : `RAW ${x.raw}`);

// Run as a command, not when imported (validate imports it; so can `node -e`, where argv[1] is empty).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const names = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!names.length) { console.error('usage: node scripts/figma/css-to-spec.mjs <Component> [...] [--json]'); process.exit(1); }
  const specs = names.map(specFor);
  if (process.argv.includes('--json')) { process.stdout.write(JSON.stringify(specs.length === 1 ? specs[0] : specs, null, 1) + '\n'); process.exit(0); }
  for (const s of specs) {
    console.log(`\n==== ${s.component}   ${s.file}`);
    for (const r of s.rules) {
      const tags = [...r.states.map((x) => `${x.attr}:${x.kind}`), ...r.interaction.map((x) => `:${x}`)];
      const decls = r.decls.filter((d) => !LAYOUT_ONLY.has(d.prop));
      if (!decls.length && !r.textStyle) continue;
      console.log(`  ${r.selector}${tags.length ? `   [${tags.join(', ')}]` : ''}`);
      if (r.textStyle) console.log(`     ${'type'.padEnd(16)} text ${r.textStyle}`);
      for (const d of decls) console.log(`     ${d.prop.padEnd(16)} ${d.map.map(show).join('  |  ')}`);
    }
    const g = s.gaps;
    console.log('  -- decide on purpose:');
    if (g.raw.length) console.log(`     raw values (mirror raw):  ${g.raw.length}`);
    if (g.runtime.length) console.log(`     computed by Base UI:      ${g.runtime.join(', ')}`);
    if (g.combinators.length) console.log(`     sibling/child selectors:  ${g.combinators.join('  ·  ')}`);
    if (g.pseudoElements.length) console.log(`     pseudo-elements:          ${g.pseudoElements.join('  ·  ')}`);
    if (g.atRules.length) console.log(`     at-rules:                 ${g.atRules.join('  ·  ')}`);
    if (g.reviewStates.length) console.log(`     unclassified states:      ${g.reviewStates.join(', ')}  ← add to STATE_ATTRS or RUNTIME_ATTRS`);
  }
}
