/**
 * validate.mjs: checks the code against the rules in AGENTS.md.
 *
 *   npm run validate             report, never fail (for prototyping)
 *   npm run validate -- --strict fail on any finding (what CI uses)
 *
 * Every rule here is one an agent (or a person) has already been told in
 * AGENTS.md, restated somewhere that actually checks it. Rules:
 *
 *   css/raw-color        no hex, rgb(), hsl(), oklch() or colour names in component CSS
 *   css/raw-size         no px or rem in component CSS (tokens, em, %, fr are fine)
 *   css/loose-type       no font-size, line-height or font-family: use font: var(--<prefix>-text-*)
 *   css/loose-weight     font-weight only through a token
 *   css/primitive-token  components use semantic or component tokens, never primitives
 *   css/unknown-token    every var(--<prefix>-*) must exist
 *   css/layer-order      every component stylesheet starts with the layer order
 *   css/important        no !important outside reset, base and utilities
 *   css/breakpoint       media queries only use the breakpoint tokens (50em, 80em)
 *   tsx/inline-style     templates, pages and prototypes do not style anything themselves
 *   tsx/raw-img          images go through Image (alt text, lazy loading, fallback)
 *   story/missing        every component has a stories file
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const STRICT = process.argv.includes('--strict');
const findings = [];
const report = (file, line, rule, message) => findings.push({ file: relative(root, file), line, rule, message });

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

const src = join(root, 'src');
const files = walk(src);
const componentDirs = ['components', 'layout', 'patterns', 'templates'].map((d) => join(src, d));
const isComponentCss = (f) => f.endsWith('.css') && componentDirs.some((d) => f.startsWith(d));

// ---------------------------------------------------------------- token names
const resolved = JSON.parse(readFileSync(join(src, 'tokens/tokens.resolved.json'), 'utf8'));
const known = new Set();
const primitives = new Set();
for (const t of resolved) {
  known.add(t.cssVar);
  if (t.tier === 'primitive') primitives.add(t.cssVar);
  if (t.type === 'typography') for (const part of Object.keys(t.css)) known.add(`${t.cssVar}-${part}`);
}
const BREAKPOINTS = resolved.filter((t) => t.key.startsWith('primitive.breakpoint.')).map((t) => t.value);
// The system's prefix ("cv" in --cv-color-…), taken from the tokens themselves.
const P = (resolved[0]?.cssVar.match(/^--([a-z0-9]+)-/) ?? [])[1] ?? 'ds';
// Variables set by our own CSS (like --<prefix>-gap) count as known.
for (const f of files.filter((f) => f.endsWith('.css'))) {
  for (const m of readFileSync(f, 'utf8').matchAll(new RegExp(`(--${P}-[a-z0-9-]+)\\s*:`, 'g'))) known.add(m[1]);
}

// ---------------------------------------------------------------- CSS rules
const COLOR_NAMES = /\b(black|white|red|blue|green|gray|grey|orange|yellow|purple|pink)\b/;
const SYSTEM_COLORS = /\b(Canvas|CanvasText|ButtonText|ButtonFace|Highlight|LinkText|GrayText)\b/;

for (const file of files.filter(isComponentCss)) {
  const text = readFileSync(file, 'utf8');
  if (!text.trimStart().startsWith('@layer reset, tokens, base, layout, components, utilities;')) {
    report(file, 1, 'css/layer-order', 'Start the file with the layer order line (see src/styles/layers.css).');
  }
  const lines = text.split('\n');
  let inComment = false;
  lines.forEach((raw, index) => {
    const n = index + 1;
    let line = raw;
    // Ignore comments, url(...) payloads and container-query conditions.
    if (inComment) {
      if (line.includes('*/')) { inComment = false; line = line.slice(line.indexOf('*/') + 2); } else return;
    }
    line = line.replace(/\/\*.*?\*\//g, '');
    if (line.includes('/*')) { inComment = true; line = line.slice(0, line.indexOf('/*')); }
    line = line.replace(/url\([^)]*\)/g, 'url()');
    if (/^\s*@container/.test(line)) return;
    // Media queries: only the two breakpoint tokens are allowed (CSS cannot use variables there).
    if (/^\s*@media/.test(line)) {
      for (const m of line.matchAll(/(min|max)-width:\s*([\d.]+[a-z]+)/g)) {
        if (!BREAKPOINTS.includes(m[2])) report(file, n, 'css/breakpoint', `${m[2]} is not a breakpoint token (${BREAKPOINTS.join(', ')})`);
      }
      return;
    }

    if (/#[0-9a-fA-F]{3,8}\b|\b(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\(/.test(line)) report(file, n, 'css/raw-color', `Raw colour: ${raw.trim()}`);
    else {
      // Only look at the value side of a declaration, so white-space: is not "white".
      const value = line.includes(':') ? line.slice(line.indexOf(':') + 1) : '';
      if (COLOR_NAMES.test(value.replace(/var\([^)]*\)/g, '')) && !SYSTEM_COLORS.test(value)) report(file, n, 'css/raw-color', `Colour name: ${raw.trim()}`);
    }

    const withoutVars = line.replace(/var\([^)]*\)/g, '');
    if (/(?<![\w-])\d*\.?\d+(px|rem)\b/.test(withoutVars)) report(file, n, 'css/raw-size', `Raw size: ${raw.trim()}`);

    if (/^\s*(font-size|line-height|font-family)\s*:/.test(line)) report(file, n, 'css/loose-type', `Set a text style instead: font: var(--${P}-text-…). Found: ${raw.trim()}`);
    if (/^\s*font-weight\s*:/.test(line) && !new RegExp(`var\\(--${P}-font-weight-`).test(line)) report(file, n, 'css/loose-weight', raw.trim());
    if (/!important/.test(line)) report(file, n, 'css/important', raw.trim());

    for (const m of line.matchAll(new RegExp(`var\\((--${P}-[a-z0-9-]+)`, 'g'))) {
      if (!known.has(m[1])) report(file, n, 'css/unknown-token', `${m[1]} does not exist`);
      else if (primitives.has(m[1])) report(file, n, 'css/primitive-token', `${m[1]} is a primitive; use a semantic or component token`);
    }
  });
}

// ---------------------------------------------------------------- TSX rules
for (const file of files.filter((f) => f.endsWith('.tsx') && !f.endsWith('.stories.tsx'))) {
  const text = readFileSync(file, 'utf8');
  const rel = relative(src, file);
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    if (/^(templates|pages|prototypes)\//.test(rel) && /\bstyle=\{/.test(line)) report(file, i + 1, 'tsx/inline-style', 'Templates and pages compose components; they do not style. A missing style is a missing component.');
    if (/<img\b/.test(line) && !/^(components\/(Image|VideoEmbed))\//.test(rel)) report(file, i + 1, 'tsx/raw-img', 'Use Image for images.');
  });
}
// Prototype stories are screens: same rule as templates.
for (const file of files.filter((f) => /\/prototypes\/.*\.stories\.tsx$/.test(f))) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (/\bstyle=\{/.test(line)) report(file, i + 1, 'tsx/inline-style', 'Prototypes use components and their props only.');
  });
}

// ---------------------------------------------------------------- stories
// A component counts as covered when any stories file imports it (templates
// are covered by the Pages and Stress test stories, not one file each).
const storySources = files.filter((f) => f.endsWith('.stories.tsx')).map((f) => readFileSync(f, 'utf8')).join('\n');
for (const dir of componentDirs) {
  for (const name of readdirSync(dir)) {
    const folder = join(dir, name);
    if (!statSync(folder).isDirectory()) continue;
    const tsx = join(folder, `${name}.tsx`);
    const imported = new RegExp(`import \\{[^}]*\\b${name}\\b`).test(storySources);
    if (existsSync(tsx) && !existsSync(join(folder, `${name}.stories.tsx`)) && !imported) {
      report(tsx, 1, 'story/missing', `${basename(folder)} has no stories file`);
    }
  }
}

// ---------------------------------------------------------------- report
for (const f of findings) console.log(`${f.file}:${f.line}  ${f.rule}  ${f.message}`);
const checked = files.filter(isComponentCss).length;
console.log(`validate: ${findings.length} finding(s) in ${checked} component stylesheets and ${files.filter((f) => f.endsWith('.tsx')).length} TSX files`);
process.exit(STRICT && findings.length ? 1 : 0);
