---
name: systemify-lean
description: Turn an existing website, a Figma file, or a plain description into a small, well-documented site in plain HTML and CSS - tokens.json, CSS layout compositions, a few native-HTML components, and a /style-guide page built from the same code - with no JavaScript framework and no Storybook. The "super simple" setup in the spirit of Derek Wood (sheriffderek) and Every Layout/CUBE CSS. Use it whenever someone wants to clean up a small site (personal page, portfolio, small business, studio, Figma Sites/Framer/Webflow/Squarespace export) into maintainable code, asks for a lean or minimal design system, a style guide page, "just HTML and CSS", Eleventy or PHP includes, or says a full design system or React would be overkill. If they want React, Storybook or prototyping through the Storybook MCP, use the `systemify` skill instead.
---

# Systemify lean: a well-documented site in plain HTML and CSS

You are a small design system team of one: you measure what exists, find the rules
behind it, and rebuild it as the least someone will happily keep maintaining. The
output is a site, not a product: plain HTML pages, one CSS architecture, a
`/style-guide` page, and a contract file an agent can read.

**The standard:** same look as the source, cleaner underneath. Nothing invented.

## What you build

```
<project>/
├── tokens/tokens.json          the one source for every value (DTCG)
├── scripts/                    build-tokens, check-css, check-contrast (copied from this skill)
├── src/
│   ├── css/  main.css · reset · tokens (generated) · base · compositions · blocks/ · utilities
│   ├── _includes/layouts/      the page shell
│   ├── _includes/components/   one Nunjucks macro per component
│   ├── _data/components.json   the contract: components, props, values, defaults, examples
│   ├── _data/tokens.json       generated, feeds the style guide
│   ├── style-guide.njk         /style-guide/: colour, voices, space, layout, components
│   └── <pages>
├── content/                    the original copy, word for word
├── docs/audit.md · docs/decisions.md
├── AGENTS.md · GAPS.md · README.md
```

Stack: **Eleventy 3 + Nunjucks** (output is static HTML, zero JS by default).
Alternatives, decided in step 0: one page and no shared parts → a single `index.html`
and `style-guide.html`, no build; the site already runs PHP → `partials/*.php` with a
`$props` array and a `style-guide.php`; the person wants a step towards components →
Astro. The CSS, tokens and checks are the same in every case.

## Read first, and when

| File | Read before |
| --- | --- |
| `references/design-system-rules.md` | Anything: the 40 rules and which check enforces each |
| `references/intake-and-audit.md` | Step 1 (URL, Figma, picture, description) |
| `references/layout.md` | Step 1 and any layout CSS |
| `references/tokens.md` | Step 2 |
| `references/css.md` | Step 3 and any CSS: which tool for which job |
| `references/components.md` | Step 4: what becomes a component, nesting, the API, the usability check |
| `references/native-components.md` | Any interactive component |
| `references/tooling.md` | Stack choices, checks, a custom MCP later |

If Chrome's **Modern Web Guidance** plugin is installed, look up each interactive or
layout feature there before writing it (`css.md` says how; the person decides).

## Workflow

Each step ends in something the person can look at. Show the audit before building,
unless they said to go straight through.

### 0 · Intake
Find out what you got (URL, Figma file, description, existing code) and read
`references/intake-and-audit.md`. Ask only what blocks you: which pages, whether the
copy may change (default: no), the stack if it is not obvious. Pick the project folder
and a 2–3 letter token prefix from the site name.

### 1 · Audit (the spec)
Measure at 375, 1024, 1440 with `assets/measure-site.js` (URL), read the Figma file
read-only, or write down the description's values as "chosen". Save screenshots and the
JSON in `docs/audit/`. Read `references/layout.md` and turn the `relations` and
`measures` into **rules** (pair spacing, measure in ch, which primitive each region
is). Write `docs/audit.md` from the template in `intake-and-audit.md`.

### 2 · Tokens
Read `references/tokens.md`. Copy `assets/starter/` into the project and the three
scripts from `scripts/` into `<project>/scripts/`. Replace the demo `tokens/tokens.json`
with the audit's values:
- two tiers: `primitive` (palette, scale) and `semantic` (purpose). No component tier.
- breakpoints as tokens, sizes that change get `$extensions.systemify.modes`.
- text styles as **voices** (Derek Wood's type patterns): `loud`, `strong`, `firm`,
  `warm`, `calm`, `quiet` in the starter. Rename to what fits the site; keep only voices
  the audit found. If the person prefers size names or plans a Figma library, use
  `display-lg / heading-md / body-md / label-md` instead and say why (see tokens.md).
- rem for sizes, em for tracking and breakpoints, ch for measure, px only for 1px lines.

Run `npm install && npm run check`. Fix what fails before going on.

### 3 · CSS architecture (CUBE CSS)
- `base.css`: elements get their default voice; headings theirs; `.voice-*` classes let
  any element take any voice (the element is meaning, the voice is look).
- `compositions.css`: wrapper, flow (with the pair rules from the audit), prose
  (measure), section, cluster, with-sidebar, switcher, grid. Delete the ones the site
  does not use. Configure with custom properties (`style="--gutter: …"`), not new classes.
- `blocks/<name>.css`: one per component, no outer margin, variants as
  `data-variant="…"`, imported in `main.css` in the `blocks` layer.
- `utilities.css`: one job each.

### 4 · Components
Decide first (`components.md`): one comparison table per family of similar things,
then merge or split by its rules. Same job and skeleton → one macro with optional parts;
small one-off differences → drift, normalised; arrangement → the composition's job.
Write the component list (name, one-sentence job, props, what it replaces) into
`docs/audit.md`. Each component is four things, or it is not done:
the macro in `_includes/components/`, its CSS in `css/blocks/`, its entry in
`_data/components.json` (props with type, allowed values, default, description; an
example; usage), and its example on the style guide (the `render` map in
`style-guide.njk`).

Interactive parts are native HTML. Read `references/native-components.md` first:
`<dialog>` + `showModal()` for anything that covers the page (the mobile menu too),
popover only for non-modal layers, `<details>` for disclosure, `<select>`, real
`<button>` and `<a>`. The starter's site header shows the pattern (invoker commands
plus a tiny fallback script).

### 5 · Recipes and pages
For each composition the site repeats (a list of articles, a contact block), one
example on the style guide under "Recipes", so it is copied instead of reassembled.

Rebuild each page from compositions and components. The copy from `content/`,
word for word. One h1, no skipped levels, alt text on every image (from the source, or
marked "needs alt from the owner" in GAPS.md). Fix the problems the audit found and say
so in the hand-off.

### 6 · Check
```bash
npm run check                                  # tokens, CSS rules, contrast (must pass)
npm run build && npx html-validate "_site/**/*.html"
npx @axe-core/cli http://localhost:8080/ http://localhost:8080/style-guide/
```
Then the usability check (`components.md`, section 8): a fresh subagent gets only
`components.json` + AGENTS.md and builds two pages that are not on the site. Every
invented prop, guess or added CSS is fixed or logged.

Then look: open the site at 375, 1024, 1440 in the browser next to the source
screenshots. Keyboard through each page (Tab, Esc in the menu, focus visible and back
on the trigger). Anything not checked goes in GAPS.md.

### 7 · Hand-off
- `AGENTS.md`: the rules (starter has them; update the prefix and breakpoints) and a
  **design language** section with the principles from the audit. It points to
  `components.json`; it does not copy lists from it.
- `GAPS.md`: what the code cannot do, what was done by hand, what nobody checked, what
  Figma could not hold. Uncertain = written as uncertain.
- `docs/decisions.md`: stack, naming, anything chosen rather than measured.
- Tell the person, in plain words: what was built, what differs from the source and
  why, what was not checked, how to run it.

## Rules that keep it lean

- Measured, not invented. No extra sections, cards, colours, dark mode, radii or
  animations the source does not have. A gap in the source is a GAPS.md line.
- One way to do each thing: a value is a token, a layout is a composition, a look is a
  voice or a block.
- Fewer is better: 5–8 voices, 8–10 space steps, the colours actually used.
- Plain words in comments, written for a designer reading the file.
- Demo content anywhere students or the public see it: fictional names, `example.com`.
- Never write to a Figma file. Read only.

## Later, if they outgrow it

- An agent can already prototype from `components.json` + AGENTS.md. A small stdio MCP
  server over the same file is ~50 lines (`references/tooling.md`).
- Storybook, React and the Storybook MCP: the `systemify` skill. Tokens and CSS carry
  over unchanged.
