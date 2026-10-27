# Skills

Skills for designers working with AI, design systems, Figma and code, by
[Christine Vallaure](https://moonlearning.io).

A skill is a written procedure an AI assistant (Claude Code, Cursor, …)
follows for one kind of job. Copy a skill's folder into your project's
`.claude/skills/` (or `~/.claude/skills/` to have it everywhere), then call
it by name or just describe the job.

| Skill | For |
| --- | --- |
| [`figma-library-from-code`](figma-library-from-code) | Build and update your Figma library from your code, so names, props and tokens match exactly. **Needs:** the Figma Console MCP (or Figma's official MCP), Node.js |
| [`storybook-figma-sync`](storybook-figma-sync) | Move a prototype between Storybook and Figma in either direction, built only from your real components. **Needs:** the Storybook MCP, the Figma Console MCP, and a Figma library whose names match your code |

They work as a pair: `figma-library-from-code` keeps the library right, `storybook-figma-sync` builds screens from it.

### Turn a site into a design system

| Skill | For |
| --- | --- |
| [`systemify`](systemify) | Hand it a website link, a Figma file, a picture or a description: it measures what exists and builds a clean design system in code. Tokens with Mobile / Tablet / Desktop modes (like Figma variable modes), React + plain CSS, Storybook 10 with docs and tests, and the Storybook MCP so agents can prototype from the real components. **Needs:** Node.js 22+, a browser tool for measuring live sites |
| [`systemify-lean`](systemify-lean) | The same method, kept as small as possible: plain HTML and CSS (Eleventy), a `/style-guide` page built from the same code, no framework, no Storybook. For personal and small-business sites. **Needs:** Node.js 22+ |

Both measure first and invent nothing, decide components by their job (not their look), use
modern CSS, and finish with an `AGENTS.md`, a `GAPS.md` and a list of what was not checked.
Each comes with a tested starter project in `assets/starter/` and the rules it follows in
`references/design-system-rules.md`.

## Learn the setup

These skills assume a design system where code and Figma match. How to set
that up is what I teach at [moonlearning.io](https://moonlearning.io). An
article about this workflow is coming soon; release news via
[moonlearning.io/newsletter](https://moonlearning.io/newsletter).

## License

MIT, see [LICENSE](LICENSE). Use them, change them, share them; keep the credit.
