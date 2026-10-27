# Native interactive components (no component library)

Researched 2026-10-27 against MDN, caniuse and webstatus.dev. Baseline changes
often: check https://webstatus.dev or the MDN banner before relying on a status,
and write the date you checked into GAPS.md. "(uncertain)" means not confirmed.

## Rules

**Always**
1. Native element first: `<button>`, `<a>`, `<dialog>`, `<details>`, `<select>`, `<label>`. ARIA only for what HTML cannot express ("no ARIA is better than bad ARIA", WAI-ARIA APG).
2. `<dialog>` + `showModal()` for anything that covers the page, **including a full-screen or slide-in mobile nav**. `popover` only for non-modal layers (dropdowns, small menus that leave the page usable).
3. Every dialog/popover: a name (`aria-labelledby`), a visible close button, a decision where focus goes on open (`autofocus`), and a check that focus returns to the trigger.
4. Non-Baseline features are enhancements only, behind `@supports` or feature detection, with a usable fallback, and logged in GAPS.md: `closedby`, `popover="hint"`, `appearance: base-select`, `interpolate-size`, `overlay`.
5. All motion inside `@media (prefers-reduced-motion: no-preference)`; exit animations optional.
6. DOM order = visual order = reading order. Anchor positioning does not change reading order.
7. Errors in text, linked with `aria-describedby`, plus `aria-invalid="true"`; style with `:user-invalid`; an error summary for long forms.
8. Live regions are in the page, empty, at load; text is injected later.
9. Test every state with axe, a scripted keyboard pass, and in Chromium, Firefox and WebKit. Write down what nobody checked with a screen reader.

**Never**
1. "CSS-only" tabs, carousels, menus or modals called accessible.
2. `role="menu"` for site navigation; details/summary as tabs, menus or modals.
3. `tabindex` on `<dialog>`; a `div role="button"` as invoker; removed focus outlines without a replacement.
4. Colour alone for errors or state; the browser's validation bubbles alone.
5. Interactive content inside `<summary>` or `<selectedcontent>`; information only in a hover tooltip.
6. Assuming `showModal()` locks scrolling, or that a popover's `::backdrop` makes it modal.
7. Taking accessibility claims from a vendor blog or AI-generated guidance without testing them.

## Modal dialog

`<dialog>` + `showModal()`: Baseline widely available since March 2022. The browser puts it in the
top layer, makes the page inert, exposes `role="dialog"` + `aria-modal`, closes on Esc, moves focus
inside, returns focus on close (spec; test it per engine).

- `closedby="any"` (light dismiss): Chrome/Edge 134, Firefox 141, Safari not stable → enhancement only.
- Invoker commands, no JS: `<button command="show-modal" commandfor="d1">`, also `close`, `request-close`. Chrome/Edge 135, Firefox 144, Safari 26.2 → Baseline newly available (~Dec 2025, date uncertain). Polyfill: https://github.com/keithamus/invokers-polyfill
- Scroll lock is NOT automatic: `html:has(dialog:modal) { overflow: hidden; scrollbar-gutter: stable; }` (iOS may still scroll; may need a script).
- Animate `::backdrop` with transitions + `allow-discrete`, not keyframes.

```html
<button command="show-modal" commandfor="d1">Delete file</button>
<dialog id="d1" aria-labelledby="d1-title" closedby="any">
  <h2 id="d1-title">Delete file?</h2>
  <form method="dialog">
    <button autofocus value="cancel">Cancel</button>
    <button value="confirm">Delete</button>
  </form>
</dialog>
```

## Mobile navigation

- Covers the page (full screen or slide-in) → `<dialog>` + `showModal()` (the page behind becomes inert).
- Dropdown that leaves the page visible → `popover` is fine.
- Inside: `<nav aria-label="Main">` with a list of links; a visible close button that gets focus on open.
- Toggle: a real `<button>` with a name ("Menu"). No `role="menu"` (https://adrianroselli.com/2023/05/be-careful-using-menu.html).

## Popover, anchor positioning, entry/exit animation

- `popover` / `popovertarget`: Baseline 2025 (newly available since Jan 2025). Always non-modal; adds behaviour, not a role (https://hidde.blog/popover-accessibility/).
- Does: implicit `aria-expanded` on the invoker, Esc and light dismiss for `popover="auto"`, focus back to the invoker, tab order continues into the popover. Does not: move focus in (add `autofocus`), close on focus out, change reading order (keep invoker and popover as DOM neighbours).
- `popover="hint"`: not Baseline (no Safari). Fall back to `auto`/`manual`.
- Anchor positioning (`position-area`, `anchor()`, `position-try-fallbacks`): Baseline newly available since Jan 2026. A popover opened by `popovertarget`/`commandfor` gets an implicit anchor. Visual only, no accessibility relation.
- `@starting-style` + `transition-behavior: allow-discrete`: Baseline 2024. `overlay` is Chromium-only, so exit animations degrade elsewhere (fine).

```css
[popover] { opacity: 0; transition: opacity .2s, display .2s allow-discrete, overlay .2s allow-discrete; }
[popover]:popover-open { opacity: 1; }
@starting-style { [popover]:popover-open { opacity: 0; } }
```

## Select

Native `<select>` with a `<label>` is the default. Customizable select (`appearance: base-select`,
`::picker(select)`, `<selectedcontent>`): Chrome/Edge 135, Safari 27, Firefox behind a flag → not
Baseline. Progressive enhancement: wrap styles in `@supports (appearance: base-select)`, keep plain text
in every option. Gotchas: no native mobile picker, no auto-width, `<selectedcontent>` is an inert clone.
https://developer.chrome.com/blog/a-customizable-select

## Disclosure and accordion

`<details>`/`<summary>`: widely available. `name` for exclusive accordions: newly available (~Sep 2024,
uncertain). `::details-content`: newly available (~Sep 2025). `interpolate-size: allow-keywords`:
Chromium only, enhancement. A heading inside `<summary>` may lose its role; exclusive accordions can
close what someone was reading; test generated accordions in Firefox.

```css
:root { interpolate-size: allow-keywords; }
details::details-content { block-size: 0; overflow: clip; transition: block-size .25s, content-visibility .25s allow-discrete; }
details[open]::details-content { block-size: auto; }
```

## Tabs

No native tabs. Default: don't use tabs on small sites; use headings or an accordion. If needed: start
from in-page links to headed sections (works without JS), then a small script turns them into the APG
tabs pattern (roles, roving tabindex, arrow keys, `aria-selected`). Page navigation is never tabs: use
`<nav>` + `aria-current="page"`.
https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ · https://inclusive-components.design/tabbed-interfaces/

## Forms

- Constraint validation (`required`, `type`, `pattern`, `checkValidity()`, `setCustomValidity()`): widely available.
- `:user-invalid` / `:user-valid`: widely available (Nov 2023). Use instead of `:invalid`.
- The usual pattern: `novalidate` on the form, validate on submit with the API, write errors into elements linked by `aria-describedby`, set `aria-invalid`, move focus to the first error or to an error summary (https://design-system.service.gov.uk/components/error-summary/).
- Visible `<label>`s, `autocomplete` tokens, hints linked with `aria-describedby`.
- `field-sizing: content`: newly available (Jun 2026). Set min and max sizes.

## Toasts and live regions

Empty `<div role="status">` (or `role="alert"` for errors) in the page at load; inject the text later;
keep it short; don't move focus; don't auto-dismiss anything with an action. `popover="manual"` can be
the visual layer; the announcement still comes from the live region. `ariaNotify()`: recent everywhere,
spec still moving → feature-detect, fall back to a live region.

## Testing

- `@axe-core/playwright` per state (open dialog, open popover, error state), not just the default. Automated tools find roughly half the issues (Deque says ~57% by volume).
- Playwright keyboard scripts: tab order, Esc closes, focus in and back, arrow keys, nothing focusable behind a modal, `aria-expanded`/`aria-selected` correct. `toMatchAriaSnapshot()` to lock the role tree.
- Manual: VoiceOver + Safari, NVDA + Firefox/Chrome, 400% zoom, forced colours, reduced motion, touch target size.

## Learn more

- MDN (component pages with Baseline banners): https://developer.mozilla.org · Baseline: https://web.dev/baseline · https://webstatus.dev · https://caniuse.com
- WAI-ARIA APG: https://www.w3.org/WAI/ARIA/apg/
- Scott O'Hara: https://scottohara.me/blog/ · Adrian Roselli: https://adrianroselli.com · Hidde de Vries: https://hidde.blog
- Sara Soueidan, Practical Accessibility (for designers and developers): https://practical-accessibility.today
- Heydon Pickering, Inclusive Components: https://inclusive-components.design
- GOV.UK Design System (form patterns): https://design-system.service.gov.uk
- Open UI: https://open-ui.org · Chrome for Developers CSS/UI: https://developer.chrome.com/docs/css-ui (double-check its accessibility claims: https://adrianroselli.com/2024/07/dont-use-webdev-for-accessibility-info.html)
