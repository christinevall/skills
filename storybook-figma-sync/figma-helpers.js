// prototype-sync — Figma helpers. Paste at the top of every figma_execute call
// that builds screens in a target file (never the library file).
//
// Keys come from figma/manifest.json → keys. Look them up before the call and
// pass only the ones this call needs in K (components), V (variables) and
// T (text styles). Never list or search the library to find a key.
//
//   const K = { Button: '7724…', Badge: '6e07…' };        // component set or component keys
//   const V = { 'space/4': '2901…', 'color/content/default': '6eff…' };
//   const T = { 'typography/heading-xl': '29f0…' };

const cache = {};
async function lib(name) {
  if (cache[name]) return cache[name];
  const key = K[name];
  if (!key) throw new Error(`no key for ${name}: add it from figma/manifest.json → keys.components`);
  try { cache[name] = await figma.importComponentSetByKeyAsync(key); }
  catch { cache[name] = await figma.importComponentByKeyAsync(key); }
  return cache[name];
}
const vars = {};
async function v(name) {
  if (!vars[name]) vars[name] = await figma.variables.importVariableByKeyAsync(V[name]);
  return vars[name];
}
const styles = {};
async function ts(name) {
  if (!styles[name]) { styles[name] = await figma.importStyleByKeyAsync(T[name]); await figma.loadFontAsync(styles[name].fontName); }
  return styles[name];
}
const paint = async (name) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', await v(name));

// An instance with its variant options set, e.g. inst('Button', { variant: 'ghost' }).
async function inst(name, variant = {}) {
  const n = await lib(name);
  const i = (n.type === 'COMPONENT_SET' ? n.defaultVariant : n).createInstance();
  if (Object.keys(variant).length) i.setProperties(variant);
  return i;
}
// Text and boolean properties by their code name; Figma adds "#id" suffixes.
function props(i, map) {
  const defs = i.componentProperties; const o = {};
  for (const [k, val] of Object.entries(map)) {
    const full = Object.keys(defs).find((d) => d.split('#')[0] === k);
    if (!full) throw new Error(`${i.name} has no property "${k}" (has: ${Object.keys(defs).map((d) => d.split('#')[0]).join(', ')})`);
    o[full] = val;
  }
  i.setProperties(o);
  return i;
}
// Exposed nested instances by component name: kids(card, 'Button')[0].
const kids = (i, name) => i.findAll((n) => n.type === 'INSTANCE' && n.name === name);

// A layout frame from the vocabulary (docs/layout.md), named and bound:
// layout('Stack', 'space/4'), layout('Cluster', 'space/2'), layout('Split'),
// layout('Columns', 'space/8'), layout('Grid', 'space/8', { columns: 3 }).
async function layout(word, gap, o = {}) {
  const f = figma.createFrame();
  f.name = [word, o.columns, gap].filter(Boolean).join(' · ') + (o.role ? ` — ${o.role}` : '');
  f.layoutMode = word === 'Stack' || word === 'Page' ? 'VERTICAL' : 'HORIZONTAL';
  f.fills = [];
  f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
  if (gap) f.setBoundVariable('itemSpacing', await v(gap));
  if (word === 'Cluster' || word === 'Grid') f.layoutWrap = 'WRAP';
  if (word === 'Split') f.primaryAxisAlignItems = 'SPACE_BETWEEN';
  if (o.center) f.counterAxisAlignItems = 'CENTER';
  for (const [side, key] of Object.entries(o.padding ?? {})) f.setBoundVariable(side, await v(key)); // { paddingLeft: 'space/6', … }
  if (o.fill) f.fills = [await paint(o.fill)];
  return f;
}
// Text only through a whole library text style and a content colour.
async function text(str, style, color = 'color/content/default') {
  const t = figma.createText();
  await t.setTextStyleIdAsync((await ts(style)).id);
  t.characters = str; t.fills = [await paint(color)]; t.name = str.slice(0, 40);
  return t;
}
function add(parent, child, fill = false) { parent.appendChild(child); if (fill) child.layoutSizingHorizontal = 'FILL'; return child; }
// Build a whole screen in one call; on retry, remove the partial result first.
