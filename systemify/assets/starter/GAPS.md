# GAPS.md

What the system cannot do, what was done by hand, what nobody checked, and what
Figma cannot express. Every entry is a decision or an open point. Uncertain
things are written as uncertain.

## Status, open points and uncertainties

| | What | Next step |
| --- | --- | --- |
| ❓ | Screen-reader pass (VoiceOver + Safari, NVDA + Firefox) | Automated a11y checks find about half the issues |
| ❓ | Only Chromium runs the story tests | Firefox and WebKit not checked |
| ❓ | Storybook AI features are "preview" | Re-check the MCP tools after a Storybook update |

## Tokens: code vs Figma

| Code | Figma | Why |
| --- | --- | --- |
| rem sizes | px numbers | Figma variables are px only |
| em letter spacing and breakpoints | no unit | DTCG 2025.10 allows px and rem only |
| `font` shorthand per text style | text style bound to variables | Figma has no shorthand |

## Layout rules Figma cannot hold

| Rule | Where in code |
| --- | --- |
| Col spans per mode | `Grid` + `Col` |
| Pair spacing, measure in ch | `Stack`, prose width |
