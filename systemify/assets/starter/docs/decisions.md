# Decisions

One entry per decision: date, what, why, what else was considered.

## <date> · React + plain CSS + Storybook 10
React because the Storybook MCP's docs tools need a components manifest, which
only React, Angular (Vite) and Vue 3 (Vite) generate. Plain CSS with `@layer`
and data attributes, no Tailwind, no component library.
