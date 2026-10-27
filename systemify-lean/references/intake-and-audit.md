# Intake and audit

The audit is the spec. Nothing gets built that the audit does not show, and every
number in the audit has a source (measured, read from a design file, or given by the person).
An earlier build of this method failed because it invented things (stat cards, rounded corners,
dark mode, a newsletter block) instead of measuring. Don't repeat that.

## 1. What did I get?

| Input | How to read it | Watch out for |
| --- | --- | --- |
| **Live URL** (any site builder, a CMS, or hand-written) | Built-in browser. Run `assets/measure-site.js` at 375, 1024 and 1440 wide (`resize_window`, then reload). Save each JSON to `docs/audit/measure-<width>.json`. Screenshot each page at each width into `docs/audit/`. | Builders keep hidden copies of other breakpoints (1px boxes), fade content in from opacity 0, and lazy-load images. The script handles these; check the numbers look sane. Copy can differ between breakpoints: pick the desktop copy and log the differences. |
| **Design file** | Read only, through whatever connection to the design tool is available (variables, text styles, screenshots). Never write to it. | No relationships (only fixed gaps), no `ch` measure, no real breakpoints (separate frames). Values may be raw with no tiers. Text styles may be per-frame copies. |
| **Picture** (screenshot, sketch, PDF) | Estimate from the image, then snap to a scale (see below). | Every value is "estimated". One width proves no breakpoint. |
| **Description** | Ask for what is missing only if it blocks you: brand colour(s), typeface, pages, tone. Everything else gets a sensible default that is written down as a default. | Mark every value "chosen, not measured" in the audit so nobody later treats it as a design decision. |
| **Existing code repo** | Read the CSS: collect custom properties, font sizes, colours, media queries (a grep is often enough). Run the site and measure it like a URL too. | The code may disagree with what renders. Trust what renders, log the difference. |

### A picture (screenshot, photo of a sketch, a PDF page)

No CSS to read, so everything is an estimate. Work like this:
1. Find the scale. Ask for the real width of the design if it isn't obvious (a 1440 desktop
   frame, a 390 phone). Divide every measurement by that factor.
2. Measure in the image (zoom into regions): text heights, gaps, column edges, colours
   (sample flat areas, not anti-aliased edges).
3. **Snap** every estimate to a sensible scale: type to a 2px/0.125rem step, space to a
   4px or 8px grid, colours to the fewest distinct values that read the same.
4. Infer the grid from repeated left edges and gutters.
5. Ask only what the picture can't show: the typeface (or "close match is fine"), other
   breakpoints (default: design mobile and tablet from the rules, marked "derived"),
   hover and interaction, real copy.
6. Mark every value in the audit **estimated** or **derived**, never "measured". One
   picture of one width cannot prove a breakpoint rule: say so in GAPS.md.

Mixed inputs are normal (a URL plus "make it a bit calmer"). The measured thing wins
for the look; the description wins for intent. Write both down.

## 2. Measure

For a URL, per width:

```text
resize_window → navigate (reload) → javascript_tool: (paste measure-site.js) → save JSON
```

The script returns: breakpoints from the site's CSS, every text style with a count and
example, colours, full-width bands, content edges, images (size, ratio, radius, fit),
**relations** (gap between stacked siblings by "kind → kind"), **measures** (line
length in `ch`), buttons, and semantics (h1 count, landmarks, images without alt,
nav items that are not links, `lang`).

Also collect by hand:
- The copy, word for word, per page, into `content/*.json`. Original text, never rewritten.
- Images: download the ones in use (largest needed size, ≤ 2000px), keep the file names meaningful.
- Interactions: what opens, what moves, what changes on hover. Click through it.
- Fonts: family, weights in use, licence (Google Fonts? self-hosted? Adobe?).

## 3. Turn numbers into a system

Work through these in order and write each into `docs/audit.md`:

1. **Breakpoints.** Use the site's own (from `media`). If there are none (some site
   builders), pick the widths where the layout actually changes and write them in `em`.
2. **Colours.** Cluster the colours by use (text, surface, border, action, status).
   Near-duplicates (ΔE < ~2, or hex values one step apart) are drift: merge, log.
3. **Text styles.** Group the measured styles by role. A role that has a different
   size per breakpoint is ONE style with modes, not three styles. Note the element
   each style was found on; the element and the style stay separate.
4. **Space.** From `relations`, find the rules (see `layout.md`): which pairs repeat,
   which steps they use. Build the scale from the steps that repeat. Outliers are drift.
5. **Layout.** Content max width, columns, gutters, margins per breakpoint; which
   primitive each region is (Sidebar, Switcher, Cluster, Grid…).
6. **Shape.** Radii, borders, shadows that are actually used. "None" is a valid answer.
7. **Components.** Every repeated UI piece, one comparison table per family of similar
   things (`components.md`, section 2). A thing seen once is a section on that page, not a component.
   Also note the **design language**: how dense, how loud, how much colour, what never
   happens (no shadows, no rounded corners). AGENTS.md gets it as principles.
8. **Problems.** Accessibility and semantics found by the script and by eye (contrast,
   heading order, missing alt, nav not links, focus invisible). These get fixed in the
   rebuild and listed as "fixed" so the person knows the rebuild is not 1:1 there.

## 4. The audit file

`docs/audit.md`, plain words, tables, evidence in brackets:

```markdown
# Audit: <site>, <date>
Source: <URL / design file / picture / description>. Measured at 375 · 1024 · 1440.

## Breakpoints        (table: name, from, why)
## Colour             (table: role, value, where seen, count)
## Text styles        (table: style name, element(s) seen on, size per mode, line height, weight, tracking, example)
## Space and rhythm   (rules in words, with evidence: "section heading → body: 24 (37/40)")
## Layout             (per breakpoint: margins, columns, gutter, max width; regions as primitives)
## Shape              (radii, borders, shadows, or "none")
## Components         (name, where, variants seen, notes)
## Copy differences   (between breakpoints)
## Problems found     (and what the rebuild does about them)
## Not measured / unsure
```

Show the audit (or its summary) to the person before building tokens, unless they
said to go straight through. It is cheap to correct here and expensive later.
