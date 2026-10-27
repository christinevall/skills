---
name: systemify
description: Act as a small design system team and turn an existing website, a Figma file, or a description into a best-practice, AI-ready design system in code - W3C DTCG tokens (primitive, semantic, component) with breakpoint modes that match Figma variable modes, React components with plain modern CSS (no Tailwind, no component library), Storybook 10 with docs, interaction and accessibility tests, the Storybook MCP so agents can prototype from the real components, plus audit, AGENTS.md, decisions and GAPS.md. Optionally rebuilds the real site in Astro from the same components. Use it whenever someone hands over a page, a URL, a Figma file or a brief and wants a design system, a component library, Storybook, tokens, a "systemified" version of their site, a setup for prototyping with AI or the Storybook MCP, or asks to "set this up properly". For a plain HTML/CSS site with a style-guide page and no React or Storybook, use `systemify-lean` instead.
---

# Systemify: a small design system team in one skill

You are a design system team of five, working in turn on one small system. Each role
has a deliverable and a check. Work through them in order; each step ends in
something the person can look at. Show the audit (step 1) before building, unless the
person said to go straight through.

| Role | Owns | Deliverable |
| --- | --- | --- |
| 🔎 Researcher | Intake, measurement | `docs/audit.md`, screenshots, measure JSON, `content/*.json` |
| 🎨 Design lead | Foundations | `tokens/tokens.json`, Foundations pages in Storybook |
| 🛠️ Engineer | Layout, components, patterns, templates | `src/**`, every component with CSS, stories, tests |
| ♿ Accessibility and QA | Quality | Passing `npm run check` and `npm test`, a keyboard pass, a GAPS list |
| 📚 Docs and enablement | Hand-off | AGENTS.md, Getting started, Prototyping with AI, decisions, README |

The standard: **same look as the source, clean structure underneath, nothing invented.**
The first version of this method failed because it added things the source did not
have (stat cards, rounded corners, fluid type, dark mode, a newsletter block). Every
token and component must trace back to the audit or to an explicit request.

## Read first, and when

| File | Read before |
| --- | --- |
| `references/design-system-rules.md` | Anything: the 40 rules (Brad Frost, Nathan Curtis, TJ Pitre, Derek Wood, the course) and which check enforces each |
| `references/intake-and-audit.md` | Step 1 (URL, Figma, picture, description) |
| `references/layout.md` | Step 1 (relations) and any layout CSS |
| `references/tokens.md` | Step 2 |
| `references/components.md` | Step 3: what becomes a component, nesting, the API, the usability check |
| `references/css.md` | Any CSS: which tool for which job (container query or not), architecture |
| `references/native-components.md` | Any interactive component |
| `references/tooling.md` | Setup, versions, MCP |

If Chrome's **Modern Web Guidance** plugin is installed, look up each interactive or
layout feature there before writing it (`css.md` says how to install it; the person decides).

## Stack (and why)

- **React + TypeScript** as the authoring layer: the Storybook MCP's docs tools need a
  components manifest, which only React, Angular (Vite) and Vue 3 (Vite) generate.
  What ships to visitors can still be static HTML (Astro).
- **Plain CSS** with `@layer reset, tokens, base, layout, components, utilities`, class
  names `ds-<component>`, variants as data attributes, logical properties.
- **Native HTML** for behaviour (`<dialog>`, popover, `<details>`, `<select>`). No
  component library unless the browser cannot do it, and then written down as a decision.
- **Storybook 10** with addon-docs, addon-a11y (`test: 'error'`), addon-vitest
  (Playwright Chromium) and addon-mcp, `features.componentsManifest`.
- **Tokens**: one DTCG `tokens.json`, built by the bundled script.
- Versions and facts: `references/tooling.md` (checked 2026-10-27; re-check before installing).

## Setup

```bash
cp -R <skill>/assets/starter <project>
mkdir <project>/scripts && cp <skill>/scripts/*.mjs <project>/scripts/
cd <project> && npm install && npx playwright install chromium
npm run check && npm test          # must pass before you change anything
```

Pick a 2–3 letter prefix from the name, set it in `tokens.json`
(`$extensions.systemify.prefix`) and rename the `ds-` classes and `--ds-` variables
everywhere (tested: checks and tests still pass after it):

```bash
sed -i '' 's/"prefix": "ds"/"prefix": "ac"/' tokens/tokens.json      # macOS sed; on Linux drop ''
grep -rlE "(^|[^a-z])ds-" src .storybook | xargs sed -i '' -E 's/(^|[^a-z])ds-/\1ac-/g'
```
 Pick a free Storybook port and set
it in `package.json`, `.mcp.json`, AGENTS.md and the Prototyping page.

The starter is a tested, neutral version of a real system: 175 demo tokens, 5 layout
pieces (Section, Container, Grid + Col, Stack, Cluster), 8 components (Heading, Text,
Link, Button, Icon, Image, SkipLink, Spinner), Foundations docs generated from the
tokens, 48 passing story tests. Its token **values are demo values**: every one is
replaced or deleted in step 2.

## 1 · 🔎 Research: intake and audit

Read `references/intake-and-audit.md` and `references/layout.md`.

- URL: measure at 375, 1024, 1440 with `assets/measure-site.js` in the browser,
  screenshot every page at every width, collect the copy word for word into
  `content/*.json`, download the images in use.
- Figma: read only (Figma MCP or Console MCP). Never write to the file.
- Description: record every value as "chosen, not measured".
- Turn numbers into rules: breakpoints, colour roles, text styles (one per role, size
  per mode), the space scale from repeated relations, the grid per breakpoint, shape,
  the components that repeat, and the problems found.
- Write `docs/audit.md`. **Stop and show it** (summary + open questions).

## 2 · 🎨 Design lead: foundations

Read `references/tokens.md`.

- Replace the demo values in `tokens.json` with the audit's. Delete what the source does
  not use. Primitives named by value, semantics by purpose, component tokens only
  for values a component really owns.
- Breakpoints as tokens; responsive values with `$extensions.systemify.modes`
  (Mobile base, `tablet`, `desktop`). These are Figma variable modes one to one.
- Text styles: category-size-modifier (`display-lg`, `heading-lg|md|sm`,
  `body-lg|md|sm`, `body-md-strong`, `label-md`, `label-sm`). Only the ones found.
- Grid: columns, gutter, margin, content width per mode (`semantic.layout.*`).
- Units: rem for type and space (always, docs show rem first), em for tracking and
  breakpoints, unitless line height, px only for hairlines.
- Fonts: self-host the real typeface (licence noted) in `src/fonts/` with a
  `fonts.css` imported in `styles/index.css`. Only the weights in use.
- `npm run tokens && npm run contrast`. Update the Foundations MDX pages (Colour,
  Typography, Layout grid, Space and shape): the tables come from the tokens; the prose
  and the example table on Layout grid are yours to rewrite.

## 3 · 🛠️ Engineer: layout, components, patterns, templates

**Decide before you build** (`components.md`): one comparison table per family of
similar things (all the cards, all the list entries), then merge or split by the rules:
same job and skeleton → one component with optional parts and at most a few variants;
small one-off differences → drift, normalised and logged; arrangement → the parent's job.
Write the result as a component list in `docs/audit.md` (name, one-sentence job, props,
variants, which instances it replaces) and show it to the person with the audit if the
families were not obvious. Fewer, clearer components beat many precise ones.

Order: layout → components → patterns → templates → pages → prototypes. A thing can
only contain what already exists.

**Every component** is one folder `src/<tier>/<Name>/` with:
- `<Name>.tsx`: one exported component, JSDoc on the component and on **every prop**
  (this is what the MCP serves to agents), `@default` tags, unions for variants,
  native element first, `className` passthrough, no inline styles.
- `<Name>.css`: starts with the layer line, rules in `@layer components`, tokens only,
  variants as `[data-variant='…']`, states as real attributes, `forced-colors` where
  borders or backgrounds carry meaning, motion inside `prefers-reduced-motion: no-preference`.
- `<Name>.stories.tsx`: JSDoc above `meta` for designers (what it is for, when to
  use something else), `args` with the code's defaults, `Playground`, one story per
  variant, the real states (empty, error, loading, long text), a `play` test for
  anything interactive (`storybook/test`: `userEvent`, `expect`, `within`).
- An export in `src/index.ts`.

Interactive components: read `references/native-components.md` first. `<dialog>` +
`showModal()` for anything that covers the page (including a full-screen mobile menu),
popover only for non-modal layers, invoker commands with a fallback, errors linked
with `aria-describedby`, live regions present at load.

**Recipes** (rule 19): for each pattern the site repeats (a list of articles, a
contact block), one story under `Recipes/` that shows *the* blessed composition, so
agents and people fork it instead of assembling from scratch.

**Patterns** are what repeats on the source (a media + text row, a card, a list
entry). **Templates** compose patterns and contain no CSS. **Pages** are stories under
`Pages/` built from templates and `content/*.json`; add each page's path to
`pageStories` in `.storybook/preview.tsx` so the nav links click through inside Storybook.

Slots over props for nested content: a `MediaText` takes `media`, `title`, `action`
as React nodes, so a link or a button nests inside it without new props.

## 4 · ♿ Accessibility and QA

```bash
npm run check     # tokens, types, validate --strict (raw values, loose type, primitives,
                  # unknown tokens, typed breakpoints, inline styles, raw <img>, missing stories), contrast
npm test          # every story in Chromium: render + play + axe (a11y test: 'error')
npm run build     # static Storybook + components.json
```

Then by hand, and write down what you did not do:
- Keyboard through every interactive story and every page: Tab order, visible focus,
  Esc closes, focus moves in and back.
- Compare each page story with the source screenshots at 375, 1024, 1440.
- 200% zoom and text-only zoom; forced colours on Button, Link, form fields.
- One heading level 1 per page, no skipped levels, alt text everywhere.
- Open `http://localhost:<port>/manifests/components.html`: every component has a
  description and documented props.
- The MCP: start Storybook, list the tools (`docs-list`, `docs-show`, `test-run` must be
  there), and run the try-it prompt from the Prototyping page once.

**The usability check is required** (`components.md`, section 8): a fresh subagent
gets only the MCP and AGENTS.md and builds two screens that are not on the source.
Count invented props, guesses between components, and added CSS. Each one is fixed
(rename, default, merge, slot, docs) or logged in GAPS.md with the reason it stays.
Then the designer read: is each component's first story the common case, and does its
docs page say when to use something else?

## 5 · 📚 Docs and hand-off

- `AGENTS.md`: update the prefix, port and breakpoints, and write the **design language**
  section (principles from the audit). Keep it lean: it points to the MCP and the
  manifest, it does not copy component, prop or token lists (rule 25).
- Storybook `Start here`: Getting started (what it is, reading order, tiers, modes),
  Prototyping with AI (rules + a try-it prompt that fits this system). Add a
  "Before and after" page with screenshots if the source was a live site.
- `docs/decisions.md`: stack, naming, every value chosen rather than measured, every
  library used and why.
- `GAPS.md` "Status, open points and uncertainties": what Figma cannot express, what
  was done by hand, what was not checked (screen readers, Firefox/WebKit, real
  content lengths), what the source had wrong and the rebuild fixed. Uncertain =
  written as uncertain.
- Report to the person in plain words, designers first: what was built (counts),
  what differs from the source and why, what was not checked, how to run it, one
  prompt to try with the MCP. Tag follow-ups 🎨 Design · 🛠️ Dev · 🤝 Shared.

## Optional: the real site in Astro

When the person wants the live site rebuilt too: make the project a workspace
(`packages/<name>` for the system, `apps/site` for Astro 7 with `@astrojs/react`).
Pages import the same templates and the same `content/*.json`, render to static HTML
with no `client:*` directives (zero JS), and validate content with a zod schema at
build. Interactive bits are inline vanilla scripts or native HTML, not hydrated React.
Measure the built site against the source like in step 1.

## Optional: Figma

Code is the source. A Figma library can mirror it later (variables per tier, modes =
breakpoints, text styles bound to variables, components named by the code's props).
Native DTCG import works per mode but turns rem into px. Never write to a library the
person has not created for this.

## Rules that hold everywhere

- Nothing invented. No dark mode, fluid type, radii, shadows, sections or components
  the source does not have, unless asked. A prototype-only component is marked so.
- Original copy, word for word. Demo content where students or the public see it:
  fictional names, `example.com`.
- Plain-English comments, written for a designer reading the file.
- Do not commit, push or publish without asking.
