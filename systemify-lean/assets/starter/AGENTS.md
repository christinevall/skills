# AGENTS.md

Rules for any agent (or person) changing this site. The checks in
`npm run check` enforce most of them.

## What this is

A small, well-documented site: plain HTML and CSS, built with Eleventy. No
JavaScript framework ships to visitors. `/style-guide/` shows every token,
voice, layout class and component.

## Design language

Principles from the audit, so new screens fit without a rule for every case.
Replace these demo lines with what the source shows:

- Calm and spacious: generous section space, one main action per view.
- Type carries the hierarchy, not colour or boxes.
- No shadows, no gradients; square corners except controls.
- Images are content, never decoration.

## Before you change anything

1. Read `src/_data/components.json`. It is the contract: the components, their
   props, allowed values and defaults. Use only what is listed. Do not invent
   props, variants or components. If something is missing, say so and ask.
2. Read `css/compositions.css` for the layout classes.
3. Values come from tokens only: `var(--fs-…)`. The list is in `src/css/tokens.css`
   (generated) or on `/style-guide/`.

## Rules

- Edit `tokens/tokens.json`, never `src/css/tokens.css` (generated). Then `npm run tokens`.
- No raw colours, no px or rem in CSS outside the tokens. 1px lines are fine.
- Type only through the voices: `font: var(--fs-text-<voice>)` in CSS, or a
  `voice-<name>` class in HTML. The element is chosen for meaning (h1, h2, p),
  the voice for the look. One h1 per page, no skipped heading levels.
- Layout with the composition classes and `gap`. Components have no outer margin.
- Media queries only at the breakpoint tokens (48em, 75em).
- New component: a macro in `src/_includes/components/`, a CSS file in
  `src/css/blocks/` imported in `main.css`, an entry in `components.json`, an
  example on the style guide. All four, or it is not done.
- Native HTML first: `<button>`, `<a>`, `<dialog>` with showModal for anything
  that covers the page, `<details>`, `<select>`. No `role="menu"` for site nav.
- Copy in `content/` or the pages is the client's: never rewrite it.
- Write what you could not do or did not check into `GAPS.md`.

## Commands

| | |
| --- | --- |
| `npm run dev` | Site + style guide at http://localhost:8080 |
| `npm run build` | Static HTML into `_site/` |
| `npm run check` | Tokens, CSS rules, contrast. Must pass before hand-off |
| `npx html-validate "_site/**/*.html"` | Markup check on the built site |
| `npx @axe-core/cli http://localhost:8080/ http://localhost:8080/style-guide/` | Accessibility scan per page |
