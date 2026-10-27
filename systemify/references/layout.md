# Layout as relationships

Researched 2026-10-27 (Baseline data from webstatus.dev). Read this before the
audit and before writing any layout CSS.

## The idea

Good CSS layout expresses **relationships**, not one-off numbers. A page built in
a visual tool records "24px here, 56px there"; the rule behind it is "a heading
followed by a paragraph gets the small space" or "body text is at most 65
characters wide". Rules survive new content; numbers don't.

Sources: Jen Simmons, intrinsic web design (2018) · Heydon Pickering, the lobotomized
owl `* + *` (A List Apart, 2014) · Every Layout (Pickering & Bell) · CUBE CSS (Andy Bell,
2020) · Nathan Curtis, Space in Design Systems (2016: inset, stack, inline) · Derek Wood,
On Type Patterns and Style Guides (CSS-Tricks, 2021).

## Vocabulary

- **Inset**: padding inside a container. **Stack**: space between rows. **Inline**: space within a row (gap).
- **Composition**: arranges children, knows nothing about what they are (stack, cluster, sidebar, switcher, center, grid). **Block**: a component with its own look. **Utility**: one job, often one token. **Exception**: a state variation as a data attribute.
- **Measure**: line length, in `ch`. 45–75ch is comfortable; above 75 is a finding.

## Every Layout primitives (pick by behaviour, not by width)

Stack (vertical rhythm) · Box (inset) · Center (centred measure) · Cluster (wrapping row) ·
Sidebar (two parts, one collapses) · Switcher (row → column at a threshold) · Cover (vertical
centring) · Grid (auto-fit columns) · Frame (aspect ratio) · Reel (horizontal scroll) ·
Imposter (overlay) · Icon · Container. https://every-layout.dev/layouts/

## Audit method (relationships, not numbers)

1. Render in a real browser at each breakpoint; switch off the page's animations.
2. For each pair of stacked siblings, record **previous role → next role, parent context, visible gap** (`assets/measure-site.js` does this: the `relations` field).
3. Cluster the gaps into a scale; snap near values (±2px or ~10%); outliers are drift, not tokens.
4. Promote a rule only if it repeats (3+ times or >70% of that pair). Otherwise list it as unclear in GAPS.md.
5. Same pair, different step in a different parent → a **context rule** ("in a card").
6. Keep inset, stack and inline separate.
7. Measure line length per text style in `ch` (the `measures` field). Record median and max.
8. Describe how each region rearranges with a primitive name (Sidebar collapses, Cluster wraps), not with pixel widths.
9. Write each rule in plain words with evidence: "section heading → body: space-l (37/40)".

## Building it in CSS (no wrapper components needed)

```css
/* Flow: space between siblings, never after the last one. */
.flow > * + * { margin-block-start: var(--flow-space, 1em); }

/* Pair rules, specificity kept flat with :where() */
:where(.flow) > :is(h2, h3) { --flow-space: var(--space-l); }
:where(.flow) > :is(h2, h3) + * { --flow-space: var(--space-xs); }

/* Measure */
.prose { max-inline-size: var(--measure, 65ch); }

/* Context */
.card :is(h2, h3) { /* smaller pattern inside cards */ }
.card:has(> img) { /* variant when there is an image */ }
```

- `gap` for every flex/grid layout; margins only in flowing text.
- Logical properties only (`margin-block-start`, `max-inline-size`).
- Components have no outer margin; the parent's composition places them.
- Layout primitives are **classes** configured with custom properties: `<div class="cluster" style="--gutter: var(--space-m)">`.
- Columns: plain CSS Grid (`grid-template-columns`, `grid-column: span 5`, `repeat(auto-fit, minmax(…))`). Subgrid to line up card rows and form labels.
- Container queries only for a component that lives in containers of different widths; media queries for the page shell and `prefers-*`. Try an intrinsic primitive first (Switcher, Sidebar).
- `text-wrap: balance` on headings; `text-wrap: pretty` only as an enhancement (no Firefox).

## Support (Baseline, 2026-10)

Widely available: `:is()/:where()`, flex `gap`, logical properties, container size queries
(Aug 2025), subgrid (Mar 2026), `:has()` (Jun 2026). Newly available: `@scope` (Mar 2026),
container style queries (May 2026), `text-wrap: balance`. Limited: `text-wrap: pretty`.

## What Figma cannot express (write these in GAPS.md as rules)

Pair spacing ("h2 after p"), parent context, `ch` measure (only a fixed max width),
`:has()`, container queries, subgrid, intrinsic switching (Switcher/Sidebar), margin collapse.

## Learn more (all checked)

- Every Layout: https://every-layout.dev/ (Stack, Sidebar, Switcher free) · Axioms: https://every-layout.dev/rudiments/axioms/
- CUBE CSS: https://cube.fyi/ · Piccalilli: https://piccalil.li/ · Build Excellent Websites: https://buildexcellentwebsit.es/
- Andy Bell's flow utility: https://piccalil.li/blog/my-favourite-3-lines-of-css/
- Jen Simmons, Layout Land: https://www.youtube.com/@LayoutLand
- Josh Comeau: https://www.joshwcomeau.com/css/interactive-guide-to-grid/ · https://www.joshwcomeau.com/css/interactive-guide-to-flexbox/
- Ahmad Shadeed: https://ishadeed.com/article/css-has-guide/ · https://ishadeed.com/article/learn-css-subgrid/ · https://defensivecss.dev/
- Rachel Andrew: https://gridbyexample.com/
- Utopia (fluid type and space): https://utopia.fyi/
- Derek Wood: https://css-tricks.com/on-type-patterns-and-style-guides/
- Nathan Curtis: https://medium.com/@nathanacurtis/space-in-design-systems-188bcbae0d62
- web.dev Learn CSS: https://web.dev/learn/css

## How the full systemify skill uses this

The React + Storybook setup keeps two decisions on purpose (Christine's, after CVDS):

- **Breakpoints as modes with media queries** (not fluid `clamp()`), because they map 1:1 to
  Figma variable modes and the source sites usually have exactly three sizes per style.
  Utopia-style fluid tokens are the alternative; offer them when the source site is fluid.
- **`Grid` + `Col` exist for prototyping**: an agent working through the Storybook MCP gets
  explicit, typed spans ("5 of 12 on Desktop"). They stay thin (one class, custom properties),
  and the relationship rules above still apply inside every column: flow, measure, context.
  On the website, the same CSS works without the wrapper.
