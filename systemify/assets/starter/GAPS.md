# GAPS.md

What the system cannot do, what was done by hand, and what nobody checked.
Every entry is a decision or an open point. Uncertain
things are written as uncertain.

## Status, open points and uncertainties

| | What | Next step |
| --- | --- | --- |
| ❓ | Screen-reader pass (VoiceOver + Safari, NVDA + Firefox) | Automated a11y checks find about half the issues |
| ❓ | Only Chromium runs the story tests | Firefox and WebKit not checked |
| ❓ | Storybook AI features are "preview" | Re-check the MCP tools after a Storybook update |

## Known deviations

| What | Why |
| --- | --- |
| em letter spacing and breakpoints | DTCG 2025.10 allows px and rem only for dimensions |
