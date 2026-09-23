# Prototyping with Claude, Figma only

For designers who have a Figma library but no Storybook yet, maybe because the
code is still too messy to connect. You can already let Claude prototype with
your real components. You need a few things in order, not a perfect library.

## Does the library have to be clean?

**No. It has to be clear.** Claude never looks at how tidy your pages are. It
reads a list of your components, and it builds only from what that list says.
So what matters is what ends up in the list:

| Matters | Does not matter |
| --- | --- |
| **Real components**, used as instances. A detached copy is invisible | How your pages are sorted or named |
| **Plain property names** and values: `variant = primary`, `size = md`, not `Property 1 = Variant 3` | Layer names inside a component |
| **States as properties**: `disabled`, `checked`, `open`, so they can be switched, not redrawn | Cover pages, documentation frames, stickers |
| **Variables and text styles** used inside components, not loose hex values | Having every component there is |
| **A description on each component**: what it is for, **use when**, **don't use when** | How pretty the library looks |
| **Auto layout** inside components | |

The description box is the one most people skip, and the one that stops Claude
guessing. With two card components, the name tells it nothing; *"Use when: the
one card that holds the page's main action"* tells it everything. Three short
lines are enough:

```
Use when: …
Don't use when: …
Options: variant (outlined | elevated), size (sm | md)
```

## Make a manifest

A **manifest** is that list: one file with every component, its properties,
its description and its *key* (the handle Claude needs to place it in another
file). Claude writes it for you:

1. Open your **library file** in Figma and run the **Figma Console MCP**'s
   *Desktop Bridge* plugin (Plugins → Development).
2. Tell Claude: **"Create a manifest from my library."** It runs
   `snapshot.figma.js` from this folder.
3. It saves the result as **`figma/manifest.json`** in your project folder.
4. **Change the library, make it again.** Claude reads the list, not the live
   file.

## Where to save it

Claude works in a folder on your computer, so give your design system one:

```
my-design-system/
├─ CLAUDE.md               a few lines: "prototype in Figma with the storybook-figma-sync skill;
│                           read figma/manifest.json and docs/layout.md"
├─ figma/manifest.json     the list Claude makes (step 2)
├─ docs/layout.md          your page rules: width, spacing, which text style for what
└─ .claude/skills/storybook-figma-sync/   the skill, copied from github.com/christinevall/skills
```

Open that folder in Claude and ask: **"Prototype a … in Figma."** Claude plans
from the list and your page rules, builds with your instances, and puts notes
beside the screens: what is real, what it built by hand, and which components
are missing.

## What you do not get yet

- **No check against code.** Without code, the library is the truth; nothing
  compares it with anything.
- **No way back into code.** Figma → Storybook needs a Storybook.

That comes the day you connect the code: the same manifest, the same skill,
and the loop closes. How to get there is what I teach at
[moonlearning.io](https://moonlearning.io).
