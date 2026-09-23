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

## Learn the setup

These skills assume a design system where code and Figma match. How to set
that up is what I teach at [moonlearning.io](https://moonlearning.io). An
article about this workflow is coming soon; release news via
[moonlearning.io/newsletter](https://moonlearning.io/newsletter).

## License

MIT, see [LICENSE](LICENSE). Use them, change them, share them; keep the credit.
