# GAPS.md

What this system cannot do, what was done by hand, and what nobody has checked.
Every entry is a decision or an open point, not an oversight. Uncertain things
are marked uncertain.

## Status, open points and uncertainties

| | What | Why it matters / next step |
| --- | --- | --- |
| ❓ | Screen-reader pass (VoiceOver + Safari, NVDA + Firefox) | Automated checks find about half the issues |
| ❓ | Invoker commands (`command`/`commandfor`) are newly Baseline; `js/invokers.js` is the fallback | Re-check in older Safari/Firefox |

## Known deviations

| What | Why |
| --- | --- |
| em letter spacing and breakpoints | DTCG 2025.10 allows px and rem only for dimensions |
