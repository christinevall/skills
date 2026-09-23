# Storybook ⇄ Figma sync

> **Needs:** the Storybook MCP · the Figma Console MCP · a Figma library whose
> names match your code (the [`figma-mirror`](../figma-mirror) skill builds one)

**Screens can start anywhere. Components only come from the system.**

A skill that moves a prototype between Storybook and Figma, in either
direction, using only the components your design system really has:

- **Storybook → Figma:** a story becomes Figma screens built from your
  library's instances (nothing detached, nothing drawn), with the prototype
  connections set and a notes frame beside it.
- **A brief → Figma:** describe a screen or flow; the AI plans it from your
  components and your code's page conventions (width, section spacing, which
  text style for what), shows you the plan, then builds it.
- **Figma → Storybook:** a Figma screen comes back as a story, made from the
  real components with the props you set in Figma. Layout frames are read as
  layout words (Stack, Cluster, Split, Columns, Grid, Page), and anything it
  would have to guess is shown to you first.

Every run ends with the same four-part notes, in Figma and in Storybook:

1. ✅ **Real library components** used
2. 🟠 **Built by hand**, and why no component covers it
3. 🔴 **Where Figma does not match Storybook**
4. 💡 **Components worth suggesting** (not built)

## What you need

This is the important part. The skill reads **names**, so it only works when
your Figma library and your code use the same ones:
`variant=primary` in Figma must be `variant="primary"` in code.

- A design system **in code**, documented in **Storybook** with the
  **Storybook MCP** (the `@storybook/addon-mcp` addon, Storybook 10), so the AI
  can look up which components exist and their props
- A **Figma library that mirrors the code**: same component names, same
  properties and values, tokens as variables, text styles
- The **Figma Console MCP** and its *Desktop Bridge* plugin, so the AI can
  read and build in Figma. Figma's official MCP runs the same plugin code
  (`use_figma`) and should work too, but this skill has only been tested with
  the Figma Console MCP so far
- A **key map**: run `snapshot.figma.js` (in this folder) once in your library
  file and save the result as your Figma manifest. The keys are how the AI
  places your components without searching the whole library. On a
  four-screen prototype, the search alone was bigger than the build; with
  keys, the whole job is estimated at about a third

Then fill in the **Setup** table at the top of `SKILL.md` (a few paths and a
branch name).

**No matching library yet?** The [`figma-mirror`](../figma-mirror) skill builds one from your code.

**Try it with a ready-made system:** the
[ds-base-ui template](https://github.com/christinevall/ds-base-ui) has all of
this set up, with a Figma library generated from its code.

## Install

```bash
git clone https://github.com/christinevall/skills.git
cp -R skills/storybook-figma-sync your-project/.claude/skills/
```

Then ask your assistant: *"Put the booking flow story into Figma"* or
*"Bring this Figma screen back to Storybook"*.

## Files

| File | Is |
| --- | --- |
| `SKILL.md` | The procedure the AI follows |
| `figma-helpers.js` | Tested building blocks for the Figma side: placing instances by key, setting props, layout frames, text styles |
| `snapshot.figma.js` | Makes the Figma manifest and key map from your library |

## Learn the setup

A design system where code and Figma match is the foundation this skill
stands on. How to build one, with AI, is what I teach at
[moonlearning.io](https://moonlearning.io). An article about this workflow is
coming soon; release news via
[moonlearning.io/newsletter](https://moonlearning.io/newsletter).

## License

MIT, see [LICENSE](../LICENSE). Use it, change it, share it; keep the credit.

## Credits

The idea of native Figma annotations for behaviour Figma cannot show comes
from [alima-max/prototype-to-figma-skill](https://github.com/alima-max/prototype-to-figma-skill).

By [Christine Vallaure](https://moonlearning.io).
