# GAPS.md

What this system cannot do, what was done by hand, and what nobody has checked.
Every entry is a decision or an open point, not an oversight. Uncertain things
are marked uncertain.

## Status, open points and uncertainties

| | What | Why it matters / next step |
| --- | --- | --- |
| ❓ | Screen-reader pass (VoiceOver + Safari, NVDA + Firefox) | Automated checks find about half the issues |
| ❓ | Invoker commands (`command`/`commandfor`) are newly Baseline; `js/invokers.js` is the fallback | Re-check in older Safari/Firefox |

## Tokens

| Code | Figma | Why |
| --- | --- | --- |
| rem sizes | px numbers | Figma variables are px only (rem × 16) |
| em letter spacing and breakpoints | not in DTCG units (px/rem only) | Known deviation from the 2025.10 spec |

## Layout rules Figma cannot hold

| Rule | Where |
| --- | --- |
| Pair spacing (`h2 + *`) | compositions.css, `.flow` |
| Measure in `ch` | `.prose` |
| Intrinsic switching (Switcher, Sidebar) | compositions.css |
