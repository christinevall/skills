# CSS: lean, modern, highest standard

Read before writing CSS, in both skills. The aim: the smallest amount of CSS that
expresses the design's rules, using what the platform already does. Not the average
of CSS seen on the web. Baseline status checked 2026-10 (webstatus.dev); re-check
anything marked newly available.

## Companion: Chrome's Modern Web Guidance (recommended)

Google Chrome and Microsoft Edge publish an agent skill pack, **Modern Web Guidance**
(Apache-2.0, preview): expert-checked guidance for 200+ web features with Baseline data
and fallbacks. https://github.com/GoogleChrome/modern-web-guidance

In Claude Code:
```
/plugin marketplace add GoogleChrome/modern-web-guidance
/plugin install modern-web-guidance@googlechrome
```
Or look up one topic without installing: `npx modern-web-guidance@latest search "animate a dialog backdrop"`.

If it is installed, look up each interactive or layout feature there before writing it
(dialog, popover, anchor positioning, container queries, view transitions, scroll-driven
animation, forms). This file stays the decision layer: *which* tool for *which* job in a
design system. Not installed by default: the person decides (it runs outside code).

## Decision guide: which tool for which job

Work down the list and stop at the first that does the job.

| Job | First choice | Then | Avoid |
| --- | --- | --- | --- |
| Space between things | `gap` on the parent (flex/grid); `.flow > * + *` in running text | Pair rules with `:where()` | Margins on components; `margin-bottom` on everything |
| A row that wraps | `flex-wrap` + `gap` (Cluster) | | Media queries to change rows |
| Side by side → stacked | **Intrinsic first**: Sidebar / Switcher (`flex-basis` + `flex-grow`), or `grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr))` | Grid + Col spans per mode (page shell) | A media query per component |
| A component that lives in narrow *and* wide places (card in a sidebar and in a main column) | **Container query**: `container-type: inline-size` on the wrapper, `@container (inline-size > 30rem)` in the component | | Media queries inside components (they ask the wrong question: the screen, not the space) |
| The page shell (columns, margins, header) | Media queries at the breakpoint tokens (= modes) | | Container queries for the page |
| User preferences | `@media (prefers-reduced-motion: no-preference)`, `prefers-contrast`, `forced-colors: active` | | Animations without the reduced-motion guard |
| Aligning parts across sibling cards (titles on one line) | `subgrid` (widely available) | | Fixed heights |
| Line length | `max-inline-size: 65ch` | | Fixed widths in px |
| Image boxes | `aspect-ratio` + `object-fit: cover` | | Padding hacks |
| Variant styles | `[data-variant="…"]` on the block, setting private custom properties | | Modifier class explosions, `!important` |
| State | Real attributes and pseudo-classes: `:disabled`, `[aria-expanded="true"]`, `[aria-current="page"]`, `:user-invalid`, `:focus-visible` | `:has()` for parent-depends-on-child (`.card:has(img)`) | `.is-active` classes that duplicate ARIA |
| Overlays | `<dialog>` (modal), `popover` (non-modal), anchor positioning (newly available, Jan 2026) | Fallback position without anchors | z-index wars, JS positioning libs |
| Enter/exit animation | `@starting-style` + `transition-behavior: allow-discrete` | | Keyframe hacks to animate `display` |
| Page-to-page transitions | View transitions, as enhancement | | |
| Headings | `text-wrap: balance` | `text-wrap: pretty` on paragraphs (enhancement) | Manual `<br>` |

**The container query rule, in one line:** a media query asks "how wide is the
screen?", a container query asks "how much room do I have?". Components ask the
second; the page shell asks the first. And before either, try a layout that adapts by
itself (Switcher, Sidebar, auto-fit grid): no query at all is the leanest.

When the system uses breakpoint modes, container queries are a documented exception:
write the component's threshold as a token, name the container, and note it in
`docs/decisions.md`.

## Architecture

- **Cascade layers**, declared once and repeated at the top of each component file:
  `@layer reset, tokens, base, layout, components, utilities;` (full skill) or
  `reset, tokens, base, compositions, blocks, utilities` (lean, CUBE CSS). Later layers win
  without specificity fights; no `!important` outside reset.
- **Low specificity**: one class per block, `:where()` for defaults that should be easy to
  override, no IDs, no element chains (`.card div p`).
- **Component custom-property API**: public knobs are tokens (`--ds-button-height`);
  internal ones are private with an underscore and set by variants:
  ```css
  .ds-button { --_bg: var(--ds-color-action-primary-background); background: var(--_bg); }
  .ds-button[data-variant="secondary"] { --_bg: transparent; }
  ```
- **`@property`** only when a custom property must animate or needs a type.
- **Native CSS nesting**: use sparingly (one level, for states and parts); it is easy to
  over-nest. Not needed to write good CSS.
- **`@scope`** (newly available, Mar 2026): only for a donut scope (style inside a
  component but not inside its slot). Otherwise one class per block is enough.
- **Logical properties** everywhere: `margin-block`, `padding-inline`, `inline-size`.
- **Units**: rem for type and space, em for things tied to the text (tracking, icon next
  to text, underline offset), `ch` for measure, unitless line height, `px` for hairlines.
- **Colour**: hex in tokens is fine. `oklch()` in primitives if the palette is built
  from a scale; `color-mix(in oklch, …)` for hover and alpha instead of new tokens when
  the system allows derived colours (write the rule down). `light-dark()` only if the
  source has a dark mode.

## Accessibility that CSS owns

- Visible focus on everything interactive: `:focus-visible` with an outline token; never
  `outline: none` without a replacement.
- `forced-colors: active`: borders on buttons and fields, `ButtonText`/`CanvasText`
  system colours where a background carried the meaning.
- Motion inside `prefers-reduced-motion: no-preference`.
- Target size: interactive things at least 24×24 CSS px (WCAG 2.2 AA), 44 recommended.
- Hidden content: `hidden`, `inert` or a visually-hidden utility that keeps it readable.
  Never `display: none` for something a screen reader needs.
- Text resizes: no fixed heights on text containers; test at 200%.

## What lean CSS never does

- No utility framework (Tailwind), no CSS-in-JS, no preprocessor needed.
- No reset of the reset: one small modern reset.
- No duplicated declarations that the cascade already gives (colour and font inherit).
- No magic numbers: every number is a token or a ratio with a comment.
- No fixed heights for content, no `position: absolute` for layout.
- No vendor prefixes by hand (Baseline features don't need them).
- No feature that is not Baseline widely available without an `@supports` guard or a
  fallback that works, logged in GAPS.md with the date checked.

## Learn more

MDN (Baseline banners on every page) · web.dev/baseline · webstatus.dev · Every Layout ·
CUBE CSS · Defensive CSS (defensivecss.dev) · the CSS Working Group drafts for cascade
layers, container queries and `@scope` · Modern Web Guidance (above).
