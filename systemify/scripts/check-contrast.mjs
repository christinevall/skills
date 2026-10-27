/**
 * check-contrast.mjs: checks text/background pairs against WCAG 2.2.
 *
 *   node scripts/check-contrast.mjs [--json src/tokens/tokens.resolved.json]
 *
 * Pairs come from the semantic colour tokens, automatically, using the
 * "on-" naming convention:
 * - text.on-X goes only on surface.X (text.on-inverse on surface.inverse)  → 4.5:1
 * - every other text.* goes on every surface that has no text.on-X partner  → 4.5:1
 * - border.strong and border.focus on those same "normal" surfaces          → 3:1 (WCAG 1.4.11)
 * Plus any extra pairs listed in tokens.json under
 *   "$extensions": { "systemify": { "contrast": [["action.primary-foreground", "action.primary-background", 4.5]] } }
 * (keys without "semantic.color."). A pair that is never used can be skipped
 * the same way: { "systemify": { "contrastSkip": ["text.on-inverse"] } }.
 *
 * Reads the resolved tokens, so run the token build first. Exits 1 on any failure.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return resolve(root, i > -1 ? process.argv[i + 1] : fallback);
};
const tokens = JSON.parse(readFileSync(arg('json', 'src/tokens/tokens.resolved.json'), 'utf8'));
const tokensJson = arg('tokens', 'tokens/tokens.json');
const ext = existsSync(tokensJson) ? JSON.parse(readFileSync(tokensJson, 'utf8')).$extensions?.systemify ?? {} : {};

const colors = Object.fromEntries(tokens.filter((t) => t.key.startsWith('semantic.color.')).map((t) => [t.key.replace('semantic.color.', ''), t.value]));
const keys = Object.keys(colors);
const skip = new Set(ext.contrastSkip ?? []);
const of = (group) => keys.filter((k) => k.startsWith(`${group}.`) && !skip.has(k));

const surfaces = of('surface').filter((k) => colors[k]?.startsWith('#'));
const onText = of('text').filter((k) => k.startsWith('text.on-'));
const special = new Set(onText.map((k) => `surface.${k.slice('text.on-'.length)}`));
const normalSurfaces = surfaces.filter((s) => !special.has(s));
const pairs = [
  ...of('text').filter((k) => !onText.includes(k)).flatMap((fg) => normalSurfaces.map((bg) => [fg, bg, 4.5])),
  ...onText.map((fg) => [fg, `surface.${fg.slice('text.on-'.length)}`, 4.5]).filter(([, bg]) => colors[bg]),
  ...['border.strong', 'border.focus'].filter((k) => colors[k]).flatMap((fg) => normalSurfaces.map((bg) => [fg, bg, 3])),
  ...(ext.contrast ?? []),
];

const channel = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex) => {
  const [r, g, b] = hex.replace('#', '').slice(0, 6).match(/../g).map((h) => channel(parseInt(h, 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

let failures = 0;
let checked = 0;
for (const [fg, bg, min] of pairs) {
  const a = colors[fg];
  const b = colors[bg];
  if (!a || !b) { console.log(`? unknown token in pair: ${fg} on ${bg}`); failures++; continue; }
  if (!a.startsWith('#') || !b.startsWith('#')) continue; // transparent values: check by eye
  checked++;
  const r = ratio(a, b);
  if (r < min) { failures++; console.log(`✗ ${fg} on ${bg}: ${r.toFixed(2)}:1 (needs ${min}:1)`); }
}
console.log(`contrast: ${checked - failures}/${checked} pairs pass`);
console.log('Note: a text colour that is only ever used on one surface can be listed in contrastSkip, or its failing pair accepted with a note in GAPS.md.');
process.exit(failures ? 1 : 0);
