// scripts/figma/snapshot.figma.js — plugin-side. Run through the Figma MCP
// (use_figma or figma_execute) and save the returned object, pretty-printed,
// as figma/manifest.json.
//
// Records what the Figma library contains, in the shape scripts/validate.mjs
// checks against the code. No timestamps and a stable order, so a diff of
// figma/manifest.json shows only real changes to the library.
// The file is named, not read: figma.root.name is "Document" through use_figma
// and the file's title through the console bridge, which would churn the diff.
//
// `keys` is the key map: the handle an agent needs to place a library item in
// another file (importComponentByKeyAsync, importStyleByKeyAsync,
// importVariableByKeyAsync). Names say what to place; keys say how to pick it
// up. A key only changes when an item is deleted and rebuilt, so a key diff in
// figma/manifest.json means every file using that item loses its link.
// Must match `prefix` in config.mjs (plugin code cannot import it).
const PREFIX = 'sds';
// The library's name, as written into the manifest.
const LIBRARY = 'sample-design-system';
const snap = { file: LIBRARY, components: [], variables: {}, codeSyntaxExceptions: {}, textStyles: [], effectStyles: [], keys: { components: {}, textStyles: {}, effectStyles: {}, variables: {} } };
const sortObj = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
for (const page of figma.root.children) {
  await page.loadAsync();
  const sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] });
  const loose = page.findAllWithCriteria({ types: ['COMPONENT'] }).filter((c) => c.parent.type !== 'COMPONENT_SET');
  for (const n of [...sets, ...loose]) {
    const isSet = n.type === 'COMPONENT_SET';
    snap.components.push({
      name: n.name,
      page: page.name,
      kind: isSet ? 'set' : 'component',
      variants: isSet ? n.children.length : 1,
      defaultVariant: isSet ? (n.defaultVariant?.name ?? null) : null,
      source: (n.description.match(/src\/components\/[\w/]+?(?:\.stories)?\.tsx/) || [null])[0], // example icons cite their story
      props: Object.entries(n.componentPropertyDefinitions).map(([k, d]) => ({
        name: k.split('#')[0],
        type: d.type,
        ...(d.type === 'VARIANT' ? { values: d.variantOptions } : {}),
        default: d.defaultValue,
      })),
    });
    snap.keys.components[n.name] = isSet
      ? { key: n.key, variants: sortObj(Object.fromEntries(n.children.map((v) => [v.name, v.key]))) }
      : { key: n.key };
  }
}
snap.components.sort((a, b) => a.name.localeCompare(b.name));
snap.keys.components = sortObj(snap.keys.components);
const byId = new Map((await figma.variables.getLocalVariablesAsync()).map((v) => [v.id, v]));
for (const c of await figma.variables.getLocalVariableCollectionsAsync()) {
  const names = c.variableIds.map((id) => byId.get(id)).filter(Boolean).map((v) => {
    const web = v.codeSyntax?.WEB ?? null;
    if (web !== `var(--${PREFIX}-${v.name.replace(/\//g, '-')})`) snap.codeSyntaxExceptions[v.name] = web;
    snap.keys.variables[v.name] = v.key;
    return v.name;
  });
  snap.variables[c.name] = { modes: c.modes.map((m) => m.name), names };
}
snap.keys.variables = sortObj(snap.keys.variables);
const textStyles = await figma.getLocalTextStylesAsync();
const effectStyles = await figma.getLocalEffectStylesAsync();
snap.textStyles = textStyles.map((s) => ({ name: s.name, textCase: s.textCase, bound: Object.keys(s.boundVariables ?? {}).sort() }));
snap.effectStyles = effectStyles.map((s) => s.name);
snap.keys.textStyles = sortObj(Object.fromEntries(textStyles.map((s) => [s.name, s.key])));
snap.keys.effectStyles = sortObj(Object.fromEntries(effectStyles.map((s) => [s.name, s.key])));
return snap;
