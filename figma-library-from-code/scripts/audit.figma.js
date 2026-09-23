// scripts/figma/audit.figma.js — plugin-side. Run through the Figma MCP after
// building or changing a component. Returns every visual value that is set by
// hand instead of coming from a variable or a style.
//
// An empty result is the bar. Values the CSS itself has raw — a min-height, a
// 1px border width, a disabled opacity, `transparent` — are not paints or
// bindings, so they never show up here. Text must use a text style, because in
// code a component's type comes from one (CLAUDE.md, rule 1).
//
// A raw value that does land in a checked field — Alert's `margin-top: 2px`,
// drawn as padding — is marked on its node, so the exception is named where it
// lives: node.setSharedPluginData(PREFIX, 'raw', 'paddingTop'), PREFIX being 'sds' here. Comma-separate
// several fields. Marked fields are skipped.
//
// Set ONLY to audit specific components, e.g. ['Checkbox', 'Tabs'].
const ONLY = null;
// Must match `prefix` in config.mjs (plugin code cannot import it).
const PREFIX = 'sds';

const out = {};
let checked = 0;
for (const page of figma.root.children) {
  await page.loadAsync();
  const roots = [
    ...page.findAllWithCriteria({ types: ['COMPONENT_SET'] }),
    ...page.findAllWithCriteria({ types: ['COMPONENT'] }).filter((c) => c.parent.type !== 'COMPONENT_SET'),
  ];
  for (const root of roots) {
    if (ONLY && !ONLY.includes(root.name.split('.')[0])) continue;
    const issues = new Set();
    const walk = (n, insideInstance) => {
      const skip = insideInstance || n.type === 'INSTANCE'; // an instance is audited through its own component
      if (!skip) {
        checked++;
        const raw = new Set(n.getSharedPluginData(PREFIX, 'raw').split(',').map((s) => s.trim()).filter(Boolean));
        for (const key of ['fills', 'strokes']) {
          if (!(key in n) || n[key] === figma.mixed || raw.has(key)) continue;
          for (const p of n[key]) {
            if (p.type === 'SOLID' && p.visible !== false && (p.opacity ?? 1) > 0 && !p.boundVariables?.color) issues.add(`${n.name} › ${key}`);
          }
        }
        if ('layoutMode' in n && n.layoutMode !== 'NONE') {
          for (const f of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'itemSpacing']) {
            if (n[f] > 0 && !n.boundVariables?.[f] && !raw.has(f)) issues.add(`${n.name} › ${f}`);
          }
        }
        if (n.type !== 'COMPONENT_SET' && typeof n.cornerRadius === 'number' && n.cornerRadius > 0 && !n.boundVariables?.topLeftRadius && !raw.has('cornerRadius')) {
          issues.add(`${n.name} › cornerRadius`);
        }
        // A text marked 'textStyle' carries a style with one field overridden, as
        // the CSS does (Select.Item: body-md, font-weight medium). Figma cannot
        // override one field of a style, so every field must be bound instead.
        if (n.type === 'TEXT' && raw.has('textStyle')) {
          // …except a field the CSS sets raw, marked too (Menu.Item's line-height: 1.2 → 'textStyle,lineHeight')
          for (const f of ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing']) if (!n.boundVariables?.[f] && !raw.has(f)) issues.add(`${n.name} › ${f}`);
        } else if (n.type === 'TEXT' && !(typeof n.textStyleId === 'string' && n.textStyleId)) issues.add(`${n.name} › text style`);
        // A component with a fixed height stops hugging its content: switch a
        // description on and it overflows. A height the CSS sets on purpose is
        // either bound to its token (Avatar's space/8) or, if raw, marked
        // 'height' (IconButton's 32/40/48px).
        if (n.type === 'COMPONENT' && n.layoutMode && n.layoutMode !== 'NONE' && !raw.has('height') && !n.boundVariables?.height) {
          const fixedHeight = n.layoutMode === 'VERTICAL' ? n.primaryAxisSizingMode === 'FIXED' : n.counterAxisSizingMode === 'FIXED';
          if (fixedHeight) issues.add(`${n.name} › fixed height`);
        }
      }
      if ('children' in n) for (const c of n.children) walk(c, skip);
    };
    walk(root, false);
    if (issues.size) out[root.name] = [...issues];
  }
}
return { nodesChecked: checked, unbound: out };
