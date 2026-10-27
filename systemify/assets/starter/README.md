# Design system

```bash
npm install
npx playwright install chromium
npm run storybook
```

Storybook: http://localhost:6006 · MCP for agents: http://localhost:6006/mcp

- `tokens/tokens.json`: every value. `npm run tokens` writes the CSS.
- `src/`: styles, layout, components, patterns, templates, prototypes, docs (MDX).
- `npm run check` and `npm test` before every hand-off.
- `AGENTS.md`: the rules. `docs/audit.md`: what the source measured. `docs/decisions.md`: why. `GAPS.md`: what is open.
