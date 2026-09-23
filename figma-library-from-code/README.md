# Figma library from code

> **Needs:** the Figma Console MCP (or Figma's official MCP) · Figma's
> `figma-use` and `figma-generate-library` skills · Node.js · a design system in
> code with tokens

**Code is the source. Figma follows it, exactly.**

A skill that builds and updates a Figma library from your design system's
code: variables and text styles from your tokens, and components with the
same names, properties, values and defaults as your code components. It is
how a Figma library becomes something an AI (and a developer) can trust:
`variant=primary` in Figma *is* `variant="primary"` in code.

That match is the foundation for everything else, including the
[`storybook-figma-sync`](../storybook-figma-sync) skill, which builds Figma
screens from the library and brings them back into code.

## What it does

- **Tokens → Figma:** variables (with light and dark modes and the CSS name as
  code syntax), text styles bound to their variables, shadows as effect styles.
- **Components → Figma:** each component's CSS is turned into a build spec
  (every colour, space, radius and text style bound to its variable), then
  built as a component set whose properties are the code's props, verbatim.
- **Proof:** an audit finds any value set by hand; a snapshot writes the
  Figma manifest, with the **key map** that lets an AI place your components in
  any file; your check compares the manifest with the code.
- **Honesty:** what Figma cannot express (hover states, runtime values,
  sibling selectors) is written down in a gaps file instead of faked.

It also carries the lessons that are not in Figma's documentation, such as
why an inner shadow blurs a frame's children or why a CSS shorthand gets
mirrored the wrong way round.

## Who it is for

Teams whose design system lives in code and who want the Figma library to
match it: an in-house system, a client's system, or the
[ds-base-ui template](https://github.com/christinevall/ds-base-ui), where
this skill built the whole library.

**Be honest about the fit.** The scripts were written for ds-base-ui and read
it well. For another system they are a strong starting point, not a switch:

| Your system has… | Fit |
| --- | --- |
| DTCG token JSON, a light and a dark file, CSS custom properties, one stylesheet per component, React + TypeScript | Change `scripts/config.mjs` and it runs |
| Tokens in another format (Tokens Studio, Style Dictionary with other paths) | Adjust the paths in `config.mjs`, maybe the reading in `tokens-to-figma.mjs` |
| State as data attributes from a headless library other than Base UI (Radix, React Aria) | Extend `STATE_ATTRS` in `css-to-spec.mjs` |
| CSS-in-JS, Tailwind utility classes | The spec script will not read it; the rules and procedure still apply |

## What you need

- Your design system **in code**, ideally with **Storybook** (the MCP addon lets
  the AI look components up)
- **Figma** with the **Figma Console MCP** (*Desktop Bridge* plugin), or Figma's
  official MCP
- Figma's own skills **`figma-use`** and **`figma-generate-library`**: they
  teach the Figma plugin API in general; this skill adds your contract on top
- **Node.js** to run the scripts

## Install

```bash
git clone https://github.com/christinevall/skills.git
cp -R skills/figma-library-from-code your-project/.claude/skills/
mkdir -p your-project/scripts/figma
cp skills/figma-library-from-code/scripts/* your-project/scripts/figma/
```

Then:

1. Edit `scripts/figma/config.mjs`: your token prefix, token files, component
   folder and fonts. Edit the `PREFIX` and `LIBRARY` lines at the top of
   `snapshot.figma.js` and `audit.figma.js` to match.
2. Fill in the **Setup** table at the top of `SKILL.md`.
3. Run the **first check** from the project root:
   `node scripts/figma/tokens-to-figma.mjs --summary` and
   `node scripts/figma/css-to-spec.mjs Button`. Both must show your tokens.
4. Ask your assistant: *"Mirror the tokens to Figma"*, then *"Mirror the
   Button to Figma"*. Start with one simple component and compare it with its
   story before doing the rest.

## Files

| File | Is |
| --- | --- |
| `SKILL.md` | The contract and the procedure the AI follows |
| `scripts/config.mjs` | Your system's settings |
| `scripts/tokens-to-figma.mjs` | Tokens → the Figma variables and styles they should be |
| `scripts/css-to-spec.mjs` | A component's CSS → the bindings and text styles it needs, and what to decide |
| `scripts/icons.mjs` | Every inline SVG icon in your components → the Figma icons page |
| `scripts/snapshot.figma.js` | Runs in Figma: the library → the Figma manifest with the key map |
| `scripts/audit.figma.js` | Runs in Figma: every value in a component set by hand instead of bound |

The check that compares the manifest with the code (`npm run validate` and
the *Sync status* page in ds-base-ui) is part of the template, not this
folder: see the [ds-base-ui repo](https://github.com/christinevall/ds-base-ui)
to copy or adapt it.

## Learn the setup

Building a design system where code and Figma match, with AI, is what I
teach at [moonlearning.io](https://moonlearning.io). An article about this
workflow is coming soon; release news via
[moonlearning.io/newsletter](https://moonlearning.io/newsletter).

## License

MIT, see [LICENSE](../LICENSE). Use it, change it, share it; keep the credit.

By [Christine Vallaure](https://moonlearning.io).
