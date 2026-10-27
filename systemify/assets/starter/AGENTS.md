# AGENTS.md

Instructions for AI agents working in this repository (Claude Code, Cursor,
Codex and others). People start with `README.md`.

Tokens, plain CSS and React components, documented in Storybook. **The code is
the source.**

## Design language

Principles from the audit, so new screens fit without a rule for every case.
Replace these demo lines with what the source shows:

- Calm and spacious: generous section space, one main action per view.
- Type carries the hierarchy, not colour or boxes.
- No shadows, no gradients; square corners except controls.
- Images are content, never decoration.

## Two kinds of work

1. **Prototyping**: building a screen *from* the system. You never change the system.
2. **Working on the system**: changing a token, a component or a story.

Know which one you are doing. If a prototype needs something the system does
not have, report it (and add it to `GAPS.md`); do not change the system on the side.

## Before anything: read the system

Storybook runs at http://localhost:6006 (`npm run storybook`) and serves an MCP
server at `/mcp`; `.mcp.json` points at it.

- Before any UI work, check the Storybook MCP tools.
- Never assume props. `docs-list`, then `docs-show` for each component you use.
  Use only props that are documented or shown in stories. If something is not
  documented, ask; do not infer it from names.
- Call `get-storybook-story-instructions` before writing a story.
- Verify with `test-run` at the end.
- Without MCP: `components.json` (`npm run manifest`) and the `*.stories.tsx`
  files hold the same information.

## Prototyping

- A prototype is a story: `src/prototypes/<Name>/<Name>.stories.tsx`,
  `title: 'Prototypes/<Name>'`, `parameters: { layout: 'fullscreen' }`.
- Import from the entry: `import { Button, Section } from '../../index'`. No other UI library, no Tailwind.
- Structure: `Section` → `Grid` + `Col` (4 / 8 / 12 columns; give the span per
  mode: `<Col tablet={4} desktop={6}>`) → `Stack` → components. One `Heading level={1}` per page.
- **No new CSS, no `style` attribute.** `npm run validate` flags it.
- Fictional names and `example.com` for invented content.
- Finish with a list of gaps: what the system could not do and what you did instead.

## Working on the system

| Where | What |
| --- | --- |
| `tokens/tokens.json` | Every token. Edit here, then `npm run tokens` |
| `src/styles/` | Layer order, reset, base. `tokens.css` is generated: never edit it |
| `src/layout/<Name>/` | Section, Container, Grid + Col, Stack, Cluster |
| `src/components/<Name>/` | `<Name>.tsx`, `<Name>.css`, `<Name>.stories.tsx` |
| `src/patterns/<Name>/` | Larger blocks built from components |
| `src/templates/` | Page layouts. Composition only, **no CSS** |
| `src/index.ts` | The public entry: add every new component |

**Rules** (checked by `npm run validate`):

- Every value in component CSS is a token: `var(--ds-…)`. No hex, rgb, px or rem.
  em, %, fr and `calc()` with tokens are fine.
- Components use semantic or component tokens, never primitives.
- Text is a whole text style: `font: var(--ds-text-body-md)` plus its `letter-spacing`.
  Never `font-size`, `line-height` or `font-family` alone. Text styles already change per mode.
- Text style names are category-size-modifier (`heading-md`, `body-md-strong`). The
  real list is in Storybook (Foundations / Typography) and the manifest; components
  take them as `textStyle`.
- Responsive = modes. Values that change per breakpoint are tokens with
  `$extensions.systemify.modes`. Layout changes go through `Col` spans. A component
  that needs a media query uses only the breakpoint tokens.
- Every component stylesheet starts with
  `@layer reset, tokens, base, layout, components, utilities;` and puts its rules in `@layer components`.
- Variants are data attributes (`data-variant`), states are real attributes
  (`:disabled`, `aria-invalid`, `aria-current`).
- Class names `ds-<component>`, parts `ds-<component>__<part>`.
- JSDoc on the component and on **every prop**: it becomes the docs and the MCP manifest.
- Images only through `Image` (alt text required).
- Native HTML first: `<dialog>` + `showModal()` for anything that covers the page,
  `popover` for non-modal layers, `<details>`, `<select>`. A library only for
  behaviour the browser does not give you, written down in `docs/decisions.md`.

**Stories**: a JSDoc above `meta` for designers (what it is for, when to use
something else); `args` with the code's defaults; `Playground`; one story per
variant; the real states (error, empty, loading); a `play` test for anything interactive.

**After a change**: `npm run check` and `npm test` pass; decisions in
`docs/decisions.md`; anything missing or unchecked in `GAPS.md`.

## Commands

```bash
npm install            # once, then: npx playwright install chromium
npm run storybook      # http://localhost:6006 · MCP at /mcp
npm test               # every story in Chromium: render, play, a11y
npm run check          # tokens + types + validate --strict + contrast
npm run build          # check + static Storybook + components.json
```

Never push, publish or deploy without asking.
