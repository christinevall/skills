# Tokens: structure, naming, units, modes

One `tokens/tokens.json` is the single source. `scripts/build-tokens.mjs` turns it into
`tokens.css` (CSS variables + one media query per breakpoint mode) and
`tokens.resolved.json` (for docs and checks). Never edit the generated files.

## Format

W3C DTCG. The stable version is **Format Module 2025.10** (28 Oct 2025, Final Community
Group Report; https://www.designtokens.org/tr/2025.10/format/).

- `$value`, `$type`, `$description`, `$extensions`. A node with `$value` is a token, everything else is a group. `$type` is inherited from the group.
- Aliases: `"{primitive.color.neutral.900}"`.
- Spec-valid values are objects: colour `{ "colorSpace": "srgb", "components": [0,0.4,0.8], "hex": "#0066cc" }`, dimension `{ "value": 1.5, "unit": "rem" }`. Plain strings (`"#0066cc"`, `"1.5rem"`) are still what most tools and files use. The build script accepts both. Pick one per file; use objects if the file will go through a spec-strict tool such as Terrazzo.
- The spec allows only `px` and `rem` for dimension units. This system also uses `em` (breakpoints, letter spacing) and that is a known deviation: write it in GAPS.md.
- Settings for the build live at the root: `"$extensions": { "systemify": { "prefix": "ac" } }`.

## Tiers

| Tier | What it is | Example | Who uses it |
| --- | --- | --- | --- |
| `primitive` | Raw values, the palette | `color.neutral.900`, `font.size.24`, `space.16` | Only semantic tokens |
| `semantic` | What a value is for | `color.text.default`, `color.surface.inverse`, `space.stack.l`, `text.heading-lg` | Components, layouts, pages |
| `component` | One component's own knobs (only when needed) | `button.padding-inline` | That component |

The lean skill uses two tiers (primitive + semantic). The full skill adds `component`
only for values a component really owns. A component tier that just re-aliases
semantic tokens 1:1 is noise.

Primitive names use the value or a step (`neutral.900`, `size.24`), never a purpose.
Semantic names never contain a value (`text.muted`, not `text.grey-500`).

## Colour naming

`color.<group>.<role>[-<state>]`

- groups: `text`, `surface`, `border`, `action`, `status`, `focus`
- `text.on-X` is the text that goes on `surface.X` (`text.on-inverse` on `surface.inverse`). The contrast script pairs them by this convention.
- states as suffixes: `action.primary-background-hover`

## Text styles (category-size-modifier)

One composite `typography` token per role. The size changes per mode; the name does not.

| Category | Use | Sizes |
| --- | --- | --- |
| `display` | Hero, very large | `display-lg` |
| `heading` | Section and card titles | `heading-lg`, `heading-md`, `heading-sm` |
| `body` | Running text | `body-lg`, `body-md`, `body-sm` |
| `label` | UI text: buttons, nav, form labels, meta | `label-md`, `label-sm` |

Modifiers after the size: `-strong`, `-italic`, `-caps` (`body-md-strong`). This is how
most large design systems name them, and it is easy to say out loud ("use heading-md here").

The element and the style stay separate: an `<h2>` can use `heading-md`; a card title
can be an `<h3>` with `heading-sm`. Purpose or "voice" names (`loud`, `calm`, `quiet`)
are the other common scheme with the same separation. Both work; the lean skill offers
voice names.

Only create a style that the audit found. Five to ten is normal for a small site.

```json
"text": {
  "$type": "typography",
  "heading-lg": {
    "$value": {
      "fontFamily": "{primitive.font.family.sans}",
      "fontWeight": "{primitive.font.weight.semibold}",
      "fontSize": "{semantic.font.size.heading-lg}",
      "lineHeight": "{semantic.font.line-height.heading-lg}",
      "letterSpacing": "{primitive.font.tracking.tight}"
    },
    "$description": "Section titles. Found on h2 on every page."
  }
}
```

The responsive part sits on the size and line-height tokens, so the text style follows:

```json
"heading-lg": { "$value": "{primitive.font.size.28}", "$extensions": { "systemify": { "modes": { "md": "{primitive.font.size.36}", "lg": "{primitive.font.size.48}" } } } }
```

The build writes `--ac-text-heading-lg` as a `font` shorthand plus its parts, so CSS
uses `font: var(--ac-text-heading-lg); letter-spacing: var(--ac-text-heading-lg-letter-spacing);`.

## Modes = breakpoints

- Mobile first: `$value` is the default (no media query). Values for larger screens live in `$extensions.systemify.modes` under the breakpoint names (`md`, `lg`). A mode without a value takes the one from the next smaller mode, like CSS does.
- Name breakpoints like media queries, by size (`md`, `lg`, add `sm` or `xl` if needed), never after devices (`tablet`, `desktop`): devices change, sizes don't.
- The breakpoints are tokens: `primitive.breakpoint.md` / `.lg` (in `em`). The build reads the mode names from them, smallest first, and generates the media queries; never type them.
- Only tokens that change get modes: font sizes, line heights, page margins, gutters, section space. Colours do not.
- No fluid type (`clamp()`) unless the source site uses it. Three fixed sizes per style are easier to read, test and talk about.
- No dark mode unless the source has one. A colour mode would be a second axis (`[data-theme]`), not a breakpoint.

## Units

| What | Unit | Why |
| --- | --- | --- |
| Font sizes, line heights as lengths, space, sizes, max widths | `rem` | Follows the user's browser font setting (WCAG 1.4.4) |
| Line height | unitless number | Scales with the font |
| Letter spacing, icon size next to text, underline offset | `em` | Scales with the text it belongs to |
| Breakpoints | `em` | Media queries in `em` respond to the browser font size; `rem` in media queries behaves the same in modern browsers but `em` is the convention |
| Measure | `ch` | Characters per line |
| Borders, outlines, hairlines | `px` | 1px should stay 1px |

Font sizes are always `rem`. Docs show rem first, with "(N px at 16px)" as a hint only.

## Checks

- `node scripts/build-tokens.mjs` fails on a broken alias, a circular alias or a name clash.
- `node scripts/check-contrast.mjs` checks text/surface pairs (4.5:1) and strong borders and focus (3:1).
- The validators (`validate.mjs` or `check-css.mjs`) fail on raw values and unknown tokens in CSS.
