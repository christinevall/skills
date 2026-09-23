/**
 * The icons the components draw → the Figma Icons page.
 *
 * Every component draws its own inline SVG. This finds each drawing, turns the
 * JSX into plain SVG, and names it by shape, so Figma can hold each one once as
 * a component and every Figma component can use an instance of it.
 *
 *   node scripts/figma/icons.mjs            the payload, as JSON
 *   node scripts/figma/icons.mjs --summary  names, users, and where drawings drifted
 *
 * Two kinds, mirrored differently (see .claude/skills/figma-library-from-code):
 *   glyph    drawn by a component itself — a fixed nested instance, no prop
 *   example  drawn in a story and passed in as children — the default of an
 *            INSTANCE_SWAP property named children
 * Spinner's circles and the popup arrow are parts of their components, not icons.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { CONFIG } from './config.mjs';

const ROOT = process.cwd(); // the project root: run from there (npm run …)
const COMPONENTS = join(ROOT, CONFIG.components);

/**
 * Shape names, matched against a drawing's geometry signature. A suffix marks a
 * second drawing of a shape the code already draws differently elsewhere — the
 * drift figma/GAPS.md records. A drawing no rule matches is an error, so a new
 * icon is named on purpose, not guessed.
 */
const NAMES = [
  ['icon/chevron-down', (s) => s === 'path(m4 6.5 4 4 4-4)'],
  ['icon/chevron-down-accordion', (s) => s === 'path(M4 6l4 4 4-4)'],
  ['icon/chevron-right', (s) => s === 'path(M6 3.5 10.5 8 6 12.5)'],
  ['icon/chevron-right-collapsible', (s) => s === 'path(M6 4l4 4-4 4)'],
  ['icon/close', (s) => s === 'path(M4 4l8 8M12 4l-8 8)' || s === 'path(m4 4 8 8M12 4l-8 8)'],
  ['icon/check', (s) => s === 'path(m3.5 8.5 3 3 6-7)'],
  ['icon/check-checkbox', (s) => s === 'path(M3.5 8.5 6.5 11.5 12.5 4.5)'],
  ['icon/dash', (s) => s === 'path(M4 8h8)'],
  ['icon/minus', (s) => s === 'path(M3.5 8h9)'],
  ['icon/plus', (s) => s === 'path(M8 3.5v9M3.5 8h9)'],
  ['icon/info-circle', (s) => s.startsWith('circle(8,8,6.5)|path(M8 7.25v4)')],
  ['icon/check-circle', (s) => s.startsWith('circle(8,8,6.5)|path(M5.25 8.25')],
  ['icon/alert-octagon', (s) => s.startsWith('path(M8.7 1.75')],
  ['icon/alert-triangle', (s) => s.startsWith('path(M7.13 2.4')],
  ['icon/person', (s) => s.startsWith('circle(8,5.5,2.75)')],
  ['icon/caret-up', (s) => s === 'path(M12 10H4l4-4.5z)'],
  ['icon/caret-down', (s) => s === 'path(M12 6H4l4 4.5z)'],
  ['icon/scrub-cursor', (s) => s.startsWith('path(M19.5 5.5L6.49737')],
  ['icon/edit', (s) => s.startsWith('path(M11.2 2.3')],
  ['icon/trash', (s) => s.startsWith('path(M2.5 4h11)')],
  ['icon/more-vertical', (s) => s.startsWith('circle(8,3.25,1.25)')],
  ['icon/bold', (s) => s.startsWith('path(M4.5 2.5h4a2.')],
  ['icon/italic', (s) => s.startsWith('path(M10.5 2.75h-3') || s.startsWith('path(M9.5 2.5h4M2.5 13.5h4')],
  ['icon/underline', (s) => s.startsWith('path(M4.5 2.5v5a3.5') || s.startsWith('path(M4 2.5v5a4 4')],
  ['icon/align-left', (s) => s === 'path(M2.5 3.5h11M2.5 6.75h7M2.5 10h11M2.5 13.25h7)'],
  ['icon/align-center', (s) => s === 'path(M2.5 3.5h11M4.5 6.75h7M2.5 10h11M4.5 13.25h7)'],
  ['icon/align-right', (s) => s === 'path(M2.5 3.5h11M6.5 6.75h7M2.5 10h11M6.5 13.25h7)'],
  ['icon/star', (s) => s.startsWith('path(M8 2.25 9.85 6')],
];
/** Drawn inline, but parts of their components rather than icons. */
const PARTS = [
  ['Spinner track and indicator', (s) => s === 'circle(8,8,6.5)|circle(8,8,6.5)'],
  ['popup arrow', (s) => s.startsWith('path(M9.66437')],
];

const JSX_TO_SVG = { strokeWidth: 'stroke-width', strokeLinecap: 'stroke-linecap', strokeLinejoin: 'stroke-linejoin', fillRule: 'fill-rule', clipRule: 'clip-rule' };
const KEEP = new Set(['width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 'clip-rule', 'd', 'cx', 'cy', 'r', 'x', 'y', 'rx', 'x1', 'y1', 'x2', 'y2', 'points']);

function attrs(jsx, file) {
  const out = {};
  for (const m of jsx.matchAll(/([\w-]+)=(?:"([^"]*)"|\{([^}]*)\})|\{\.\.\.(\w+)\}/g)) {
    if (m[4]) { Object.assign(out, spread(file, m[4])); continue; }
    const name = JSX_TO_SVG[m[1]] ?? m[1];
    out[name] = m[2] ?? m[3].trim().replace(/^['"]|['"]$/g, '');
  }
  return out;
}
function spread(file, ident) {
  const body = file.match(new RegExp(`const ${ident} = \\{([\\s\\S]*?)\\}`))?.[1];
  if (!body) throw new Error(`icons: cannot resolve {...${ident}}`);
  const out = {};
  for (const m of body.matchAll(/(\w+|'[^']+')\s*:\s*(?:'([^']*)'|"([^"]*)"|([\d.]+|true|false))/g)) {
    const key = m[1].replace(/'/g, '');
    out[JSX_TO_SVG[key] ?? key] = m[2] ?? m[3] ?? m[4];
  }
  return out;
}
const constant = (file, name) => file.match(new RegExp(`const ${name} = '([^']+)'`))?.[1];

/** One drawing per concrete call: `d={param}` expands to every constant a call site passes. */
function drawings(file) {
  const out = [];
  for (const m of file.matchAll(/<svg\b([\s\S]*?)>([\s\S]*?)<\/svg>/g)) {
    const svg = attrs(m[1], file);
    const children = [...m[2].matchAll(/<(path|circle|rect|line|polyline|polygon)\b([\s\S]*?)\/?>/g)].map((c) => ({ tag: c[1], a: attrs(c[2], file), raw: c[2] }));
    const dynamic = children.find((c) => /d=\{\s*(\w+)\s*\}/.test(c.raw));
    if (!dynamic) { out.push({ svg, children }); continue; }
    const param = dynamic.raw.match(/d=\{\s*(\w+)\s*\}/)[1];
    // Call sites are components (<Icon d={BOLD} />), so a capital letter — which
    // also keeps the helper's own <path d={d} /> from matching itself.
    for (const call of file.matchAll(new RegExp(`<[A-Z]\\w*\\s+${param}=\\{(\\w+)\\}`, 'g'))) {
      const d = constant(file, call[1]);
      if (!d) throw new Error(`icons: cannot resolve ${param}={${call[1]}}`);
      out.push({ svg, children: children.map((c) => (c === dynamic ? { ...c, a: { ...c.a, d } } : c)) });
    }
  }
  return out;
}

/**
 * A path in absolute coordinates, so `M4 4l8 8` and `m4 4 8 8` compare equal.
 * Comparing the text would call one drawing two, which is how this found a
 * false drift the first time it ran.
 */
function absolute(d) {
  const t = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g);
  const f = (n) => +n.toFixed(3);
  const out = [];
  let i = 0, cmd = null, x = 0, y = 0, sx = 0, sy = 0;
  const num = () => Number(t[i++]);
  while (i < t.length) {
    if (/[a-zA-Z]/.test(t[i])) cmd = t[i++];
    else if (cmd === 'M') cmd = 'L';
    else if (cmd === 'm') cmd = 'l'; // extra pairs after a moveto are linetos
    const rel = cmd === cmd.toLowerCase();
    switch (cmd.toUpperCase()) {
      case 'M': case 'L': {
        let nx = num(), ny = num();
        if (rel) { nx += x; ny += y; }
        x = nx; y = ny;
        if (cmd.toUpperCase() === 'M') { sx = x; sy = y; }
        out.push(`${cmd.toUpperCase()}${f(x)},${f(y)}`);
        break;
      }
      case 'H': { let nx = num(); if (rel) nx += x; x = nx; out.push(`L${f(x)},${f(y)}`); break; }
      case 'V': { let ny = num(); if (rel) ny += y; y = ny; out.push(`L${f(x)},${f(y)}`); break; }
      case 'C': {
        const p = [num(), num(), num(), num(), num(), num()];
        if (rel) for (let k = 0; k < 6; k += 2) { p[k] += x; p[k + 1] += y; }
        x = p[4]; y = p[5];
        out.push(`C${p.map(f).join(',')}`);
        break;
      }
      case 'A': {
        const [rx, ry, rot, large, sweep] = [num(), num(), num(), num(), num()];
        let nx = num(), ny = num();
        if (rel) { nx += x; ny += y; }
        x = nx; y = ny;
        out.push(`A${[rx, ry, rot, large, sweep, x, y].map(f).join(',')}`);
        break;
      }
      case 'Z': x = sx; y = sy; out.push('Z'); break;
      default: throw new Error(`icons: unsupported path command "${cmd}" in ${d}`);
    }
  }
  return out.join(' ');
}
const geometry = (children) =>
  children.map((c) => (c.tag === 'path' ? `path(${absolute(c.a.d)})` : `${c.tag}(${c.a.cx},${c.a.cy},${c.a.r})`)).join('|');

const signature = (children) =>
  children.map((c) => (c.tag === 'path' ? `path(${c.a.d})` : `${c.tag}(${c.a.cx},${c.a.cy},${c.a.r})`)).join('|');

function toSvg({ svg, children }) {
  const vb = svg.viewBox ?? `0 0 ${svg.width} ${svg.height}`;
  const [, , w, h] = vb.split(/\s+/).map(Number);
  const own = (a) => Object.entries(a).filter(([k]) => KEEP.has(k) && k !== 'width' && k !== 'height' && k !== 'viewBox')
    .map(([k, v]) => `${k}="${String(v).replace(/currentColor/gi, '#000000')}"`).join(' ');
  const body = children.map((c) => `<${c.tag} ${own(c.a)}/>`).join('');
  return { width: Number(svg.width ?? w), height: Number(svg.height ?? h), svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${svg.width ?? w}" height="${svg.height ?? h}" viewBox="${vb}" ${own(svg)}>${body}</svg>` };
}

export function buildIcons() {
  const icons = new Map();
  const skipped = [];
  const files = readdirSync(COMPONENTS).flatMap((dir) =>
    readdirSync(join(COMPONENTS, dir)).filter((f) => f.endsWith('.tsx')).map((f) => ({ dir, f, path: `${CONFIG.components}/${dir}/${f}` })));
  // Components first, then stories: a glyph a component draws outranks the same shape in an example.
  files.sort((a, b) => a.f.endsWith('.stories.tsx') - b.f.endsWith('.stories.tsx') || a.path.localeCompare(b.path));
  for (const { dir, f, path } of files) {
    const src = readFileSync(join(ROOT, path), 'utf8');
    const story = f.endsWith('.stories.tsx');
    for (const drawing of drawings(src)) {
      const sig = signature(drawing.children);
      if (PARTS.some(([, test]) => test(sig))) continue;
      const name = NAMES.find(([, test]) => test(sig))?.[0];
      if (!name) throw new Error(`icons: unnamed drawing in ${path}: ${sig} — add it to NAMES`);
      const all = { ...drawing.svg, ...Object.assign({}, ...drawing.children.map((c) => c.a)) };
      const paint = all.stroke && all.stroke !== 'none' ? 'stroke' : 'fill';
      const strokeWidth = paint === 'stroke' ? Number(all['stroke-width'] ?? 1) : null;
      const key = [geometry(drawing.children), paint, strokeWidth, all['stroke-linecap'] ?? '', all['stroke-linejoin'] ?? ''].join(' · ');
      const existing = icons.get(name);
      if (existing) {
        if (existing.key !== key) {
          if (existing.kind === 'glyph' && !story) throw new Error(`icons: ${name} is drawn two ways by components (${existing.source}, ${path}) — give the second its own name`);
          skipped.push({ name, file: path, reason: `another drawing of ${name}; kept the one from ${existing.source}` });
          continue;
        }
        existing.users.add(dir);
        continue;
      }
      icons.set(name, {
        name, kind: story ? 'example' : 'glyph', source: path, signature: sig, key, paint, strokeWidth,
        // NumberField's cursor takes its fill from CSS and a surface-coloured halo stroke.
        halo: name === 'icon/scrub-cursor',
        users: new Set([dir]), ...toSvg(drawing),
      });
    }
  }
  return {
    icons: [...icons.values()].map((i) => ({ ...i, users: [...i.users].sort() })).sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name)),
    skipped,
  };
}

// Run as a command, not when imported.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { icons, skipped } = buildIcons();
  if (!process.argv.includes('--summary')) { process.stdout.write(JSON.stringify({ icons, skipped }, null, 1) + '\n'); process.exit(0); }
  for (const kind of ['glyph', 'example']) {
    const list = icons.filter((i) => i.kind === kind);
    console.log(`\n${kind}s (${list.length})`);
    for (const i of list) console.log(`  ${i.name.padEnd(32)} ${i.paint}${i.strokeWidth ? ` ${i.strokeWidth}` : ''}${i.halo ? ' + halo' : ''}  ${i.width}×${i.height}   ${i.users.join(', ')}`);
  }
  const drift = icons.filter((i) => /-(accordion|collapsible|checkbox)$/.test(i.name));
  console.log(`\ndrift — the same shape drawn differently by components (${drift.length}):`);
  for (const i of drift) console.log(`  ${i.name}  ← ${i.users.join(', ')}`);
  console.log(`\nexample drawings skipped (${skipped.length}):`);
  for (const s of skipped) console.log(`  ${s.name}  ${s.file}`);
}
