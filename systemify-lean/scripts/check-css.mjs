/**
 * check-css.mjs: checks every stylesheet against the rules in AGENTS.md.
 * No dependencies, so it runs anywhere Node runs.
 *
 *   node scripts/check-css.mjs [--css css] [--tokens css/tokens.css] [--strict]
 *
 * Rules:
 *   raw-color      no hex, rgb(), hsl(), oklch() outside tokens.css: use a colour token
 *   raw-font-size  font-size only through a token, em or %: use the text styles
 *   px-size        no px for space or type (1px anywhere, 2px for border/outline/underline)
 *   unknown-token  every var(--<prefix>-*) must exist in tokens.css
 *   primitive      outside tokens.css, use semantic tokens, not primitives (lean: warn only)
 *   breakpoint     media queries use the breakpoint values from the tokens
 *   important      no !important outside reset.css
 *
 * Without --strict it reports and exits 0 (for working); with --strict it exits 1
 * on any error (for CI or before hand-off).
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve, basename } from 'node:path';

const cwd = process.cwd();
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return resolve(cwd, i > -1 ? process.argv[i + 1] : fallback);
};
const CSS_DIR = arg('css', 'css');
const TOKENS = arg('tokens', join(relative(cwd, CSS_DIR), 'tokens.css'));
const STRICT = process.argv.includes('--strict');

if (!existsSync(TOKENS)) { console.error(`No tokens file at ${relative(cwd, TOKENS)}. Run the token build first.`); process.exit(1); }

const tokenCss = readFileSync(TOKENS, 'utf8');
const defined = new Set([...tokenCss.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
const prefix = ([...defined][0]?.match(/^--([a-z0-9]+)-/) ?? [])[1] ?? 'ds';
// Primitives are the variables under the "Tier 1" comment, up to the next tier.
const tier1 = tokenCss.split('Tier 2')[0];
const primitives = new Set([...tier1.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
const breakpoints = new Set([...tokenCss.matchAll(/@media \(min-width: ([^)]+)\)/g)].map((m) => m[1].trim()));

const walk = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? (n === 'node_modules' || n.startsWith('_') ? [] : walk(p)) : p.endsWith('.css') ? [p] : [];
});
const files = walk(CSS_DIR).filter((f) => resolve(f) !== TOKENS);

const findings = [];
const report = (level, file, line, rule, msg) => findings.push({ level, file: relative(cwd, file), line, rule, msg });

const RAW_COLOR = /#[0-9a-f]{3,8}\b|\b(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|hwb)\(/i;

for (const file of files) {
  const isReset = basename(file) === 'reset.css';
  // Strip comments but keep line numbers.
  const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  text.split('\n').forEach((line, i) => {
    const n = i + 1;
    // Declarations on this line, also inside one-line rules (`.x { color: red; }`).
    // A selector like `a:hover {` does not match: its "value" would run into `{`.
    for (const [, prop, value] of line.matchAll(/(?:^|[;{])\s*([a-z-]+)\s*:\s*([^;{}]+?)\s*(?=;|}|$)/gi)) {
      if (!prop.startsWith('--') && RAW_COLOR.test(value)) report('error', file, n, 'raw-color', `${prop}: ${value} → use a colour token`);
      if (prop === 'font-size' && !/var\(|em\b|%|inherit|^1em$/.test(value)) report('error', file, n, 'raw-font-size', `font-size: ${value} → use a text style token`);
      if (prop === 'font' && !/var\(|^inherit$/.test(value)) report('error', file, n, 'raw-font-size', `font: ${value} → use font: var(--${prefix}-text-…)`);
      // 1px is allowed anywhere (hairlines, visually-hidden); 2px only for lines.
      const pxValues = (value.match(/\b\d*\.?\d+px\b/g) ?? []).filter((v) => v !== '1px' && !(v === '2px' && /^(border|outline|text-decoration)/.test(prop)));
      if (pxValues.length && !prop.startsWith('--')) report('error', file, n, 'px-size', `${prop}: ${value} → rem token (px only for 1–2px lines)`);
      if (/!important/.test(value) && !isReset) report('error', file, n, 'important', `${prop} uses !important`);
    }
    for (const [, name] of line.matchAll(/var\((--[a-z0-9-]+)/g)) {
      if (!name.startsWith(`--${prefix}-`)) continue; // local custom properties (--gutter, --flow-space) are fine
      if (!defined.has(name)) report('error', file, n, 'unknown-token', `${name} is not in tokens.css`);
      else if (primitives.has(name)) report('warn', file, n, 'primitive', `${name} is a primitive → use a semantic token`);
    }
    const mq = line.match(/@media[^{]*\((?:min|max)-width:\s*([^)]+)\)/);
    if (mq && !breakpoints.has(mq[1].trim())) report('error', file, n, 'breakpoint', `media query ${mq[1].trim()} is not a breakpoint token (${[...breakpoints].join(', ') || 'none defined'})`);
  });
}

for (const f of findings) console.log(`${f.level === 'error' ? '✗' : '!'} ${f.file}:${f.line}  ${f.rule}  ${f.msg}`);
const errors = findings.filter((f) => f.level === 'error').length;
console.log(`check-css: ${files.length} files, ${errors} errors, ${findings.length - errors} warnings`);
process.exit(STRICT && errors ? 1 : 0);
