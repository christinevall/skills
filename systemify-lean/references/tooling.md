# Tooling (versions and facts checked 2026-10-27)

Versions from the npm registry on 2026-10-27. Re-check with `npm view <pkg> version`
before installing, and pin what you install. "UNVERIFIED" = not confirmed on an
official page.

## Versions

| Package | Version | Note |
| --- | --- | --- |
| `storybook`, `@storybook/*` | 10.6.4 | Pin `^10.6`. 11 is in alpha. |
| `@storybook/addon-mcp` | 10.6.4 | Peers: storybook ^10.6.4, addon-vitest ^10.6.4 |
| `vitest` | 5.0.5 | addon-vitest needs ≥ 3 |
| `astro` | 7.4.2 | |
| `@11ty/eleventy` | 3.1.7 | 4.0 in alpha |
| `style-dictionary` | 5.7.1 | No resolver module yet |
| `@terrazzo/cli` | 2.10.0 | Full DTCG 2025.10 incl. resolver |
| `stylelint` | 17.16.0 | |
| `html-validate` | 11.17.0 | |
| `@axe-core/playwright`, `@axe-core/cli` | 4.14.0 | |
| `@modelcontextprotocol/server` | 2.4.0 | v2 SDK, stable since Jul 2026 |

## Storybook MCP (`@storybook/addon-mcp`)

Docs: https://storybook.js.org/docs/ai/mcp/overview. Storybook calls its AI features
"preview": they may change.

- Install: `npx storybook add @storybook/addon-mcp`. Endpoint: `http://localhost:<port>/mcp`.
- `.storybook/main.ts`: `features: { componentsManifest: true }`.
- Three toolsets:
  - development: `get-storybook-story-instructions`, `stories-preview`, `stories-find-by-component`, `stories-changed`
  - docs (needs the components manifest): `docs-list`, `docs-show`, `docs-show-story`
  - testing (needs addon-vitest): `test-run`, returns test and a11y results
- **Which frameworks generate the manifest:** every React framework (react-vite, nextjs, …), `angular-vite`, `vue3-vite` (+ `experimentalDocgenServer`). Not html-vite, not web-components-vite, not Webpack Angular. Without the manifest an agent gets previews and tests but no machine-readable props. That is why the full skill uses React.
- Manifest routes: `/manifests/components.json`, `/manifests/docs.json` (from MDX), `/manifests/components.html` (debug page: open it after each change).
- JSDoc on every prop: the manifest carries it to the agent.
- Connect Claude Code: `claude mcp add --transport http storybook --scope project http://localhost:6006/mcp`, which writes `.mcp.json`:
  ```json
  { "mcpServers": { "storybook": { "type": "http", "url": "http://localhost:6006/mcp" } } }
  ```
  Cursor: `.cursor/mcp.json`, same without `type`.
- The overview page has an official AGENTS.md sample: tools first, `docs-list` then `docs-show`, never invent props, `get-storybook-story-instructions` before writing stories, `test-run` at the end. Copy it from the page into the project's AGENTS.md (the template in `assets/` summarises it).

## Storybook tests

- `@storybook/addon-vitest`: `npx storybook add @storybook/addon-vitest`, run `vitest --project=storybook`. Needs a Vite framework and Playwright Chromium (`npx playwright install chromium`, also in CI).
- `@storybook/addon-a11y`: set `parameters.a11y.test = 'error'` in `preview.tsx`; the default is undefined (no failure). `'todo'` only warns. Narrower settings (meta, story) win.
- Every story is a smoke test and an a11y test; play functions add interaction tests.

## Tokens: build tools

| Option | When |
| --- | --- |
| The bundled `build-tokens.mjs` (~190 lines, no deps) | Default. Readable by designers, does breakpoint modes and text-style shorthands. You own the maths. |
| Terrazzo 2.x (`npx tz init`, `tz build`, `tz lint`) | Spec-pure 2025.10, resolver for light/dark in one build, built-in token lint |
| Style Dictionary 5.7 | Biggest ecosystem, many output formats. No resolver: one build per mode |

## Figma and DTCG (native import/export)

Figma imports DTCG JSON per mode (drag into a collection, or Import mode) and exports per
mode. Dimensions become px numbers (rem is lost), colour sRGB/HSL only, a fontFamily is a
single name. Aliases across collections use `com.figma.aliasData`. UNVERIFIED: exported
colour format and whether aliases survive export.

## Lean stacks (no React)

| Stack | Components are | `/style-guide` | Designer learns |
| --- | --- | --- | --- |
| Plain HTML | Copy-paste snippets | `style-guide.html` by hand | HTML, CSS |
| Eleventy 3 + Nunjucks | `{% macro %}` in `_includes/components/` | Page loops over `_data/components.json` and calls each macro | HTML, front matter, one macro syntax |
| Eleventy 3 + WebC | `_components/<name>.webc`, filename = tag | Same | HTML-like attributes |
| PHP includes | `partials/<name>.php` with a `$props` array | `style-guide.php` | One include line; needs `php -S` locally |
| Astro 7 | `.astro` files, zero JS by default, scoped styles | `src/pages/style-guide.astro` | Front matter + JSX-like templates; closest step to React |

Agent contract without Storybook: a hand-written `components.json` (name, description,
props/attributes with values and defaults, slots, an example snippet, status). AGENTS.md
tells the agent to read it and use only what is listed. A Custom Elements Manifest does
the same for web components (UNVERIFIED in detail).

## A small custom MCP server (later, optional)

When the `components.json` contract grows, wrap it in a stdio MCP server, about 50 lines
on the v2 SDK:

```js
import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';
import components from '../components.json' with { type: 'json' };

const server = new McpServer({ name: 'design-system', version: '1.0.0' });
server.registerTool('list_components', { description: 'Every component with a one-line description', inputSchema: z.object({}) },
  async () => ({ content: [{ type: 'text', text: JSON.stringify(components.map(({ name, description }) => ({ name, description }))) }] }));
server.registerTool('get_component', { description: 'Props, slots and an example for one component', inputSchema: z.object({ name: z.string() }) },
  async ({ name }) => ({ content: [{ type: 'text', text: JSON.stringify(components.find((c) => c.name === name) ?? { error: `No component ${name}` }) }] }));
await server.connect(new StdioServerTransport());
```

Register in `.mcp.json`: `{ "mcpServers": { "ds": { "command": "node", "args": ["mcp/server.mjs"] } } }`.
Add `get_tokens` the same way. Not tested by me yet: say so if you ship it.

## Quality checks

| Check | Lean | Full | What it catches |
| --- | --- | --- | --- |
| `check-css.mjs` / `validate.mjs` (bundled, no deps) | ✓ | ✓ | Raw colours and sizes, loose type, unknown tokens, typed breakpoints |
| `check-contrast.mjs` (bundled) | ✓ | ✓ | Token pairs below 4.5:1 / 3:1 |
| stylelint 17 + `stylelint-declaration-strict-value` + `stylelint-value-no-unknown-custom-properties` | optional | optional | Same drift as the bundled checks, inside the editor |
| `html-validate` on built HTML | ✓ | site only | Broken markup, many ARIA attribute errors |
| `@axe-core/cli <url>` | ✓ | | Page-level a11y, one command per URL |
| Storybook a11y (`test: 'error'`) + addon-vitest | | ✓ | Every component state |
| `@axe-core/playwright` | | composed pages | Page-level a11y in a test |
| pa11y, Lighthouse CI | skip | skip | Overlap with axe; run `npx lighthouse` by hand if wanted |

Automated a11y tools find roughly half the issues. Keyboard and screen-reader checks
are manual: list what nobody checked in GAPS.md.
