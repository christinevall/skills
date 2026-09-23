---
name: storybook-figma-sync
description: Move a prototype between Storybook and Figma in either direction, or design a new one in Figma from a brief, using only real components. Storybook → Figma and brief → Figma build screens from Figma library instances, with prototype connections and a notes overview; Figma → Storybook rebuilds a Figma screen as a story from the real components. Use when asked to design, build or prototype a screen in Figma, to put a prototype or story into Figma, to bring a Figma screen or change back to Storybook or code, or to "sync" a prototype. Needs the Figma Console MCP and a Figma manifest; the Storybook directions also need the Storybook MCP and a library whose names match the code. Brief → Figma works from Figma alone (docs/figma-only.md). Not for changing the library itself.
---

# Storybook ⇄ Figma sync — prototypes from real components

**Screens can start anywhere. Components only come from the system.**

A designer may draw a few screens in Figma, or prototype in code and look at
it in Storybook. Either way the screen is made of components that exist in
code and are mirrored in the Figma library, so it can travel both ways
without guessing. Nothing is invented on the way: a missing component is
built as a plain frame, marked, and listed as a suggestion.

This skill **never changes the library or a component**. The library file is
read only here; library changes go through `figma-library-from-code`, component changes
through a `feature/*` branch. Prototypes live on the `design` branch.

## Setup (once per design system)

The steps below use these names. In the `ds-base-ui` template they are
already right; for another system, change them here and nowhere else.

| Setting | In ds-base-ui | What it is |
| --- | --- | --- |
| MCP | Storybook MCP (`.mcp.json`); Figma Console MCP with its Desktop Bridge plugin | How the AI reads components in Storybook and builds in Figma. Figma's official MCP (`use_figma`) runs the same plugin code and should work too, but is not tested with this skill yet |
| Figma manifest | `figma/manifest.json` | What the library contains: names, properties, **descriptions** and `keys`. Made by `snapshot.figma.js` in this folder |
| Code manifest | Storybook MCP, or `storybook-static/manifests/components.json` | What exists in code, with props |
| Layout words | `docs/layout.md` | Stack, Cluster, Split, Columns, Grid, Page, mapped to your CSS |
| Known differences | `figma/GAPS.md` | Where Figma cannot match code on purpose |
| Sync check | `npm run sync-status -- --summary` | Optional: are code and Figma in sync? |
| Prototype branch | `design` | Where prototypes are written |
| Target file | the Playground | The Figma file screens are built in (never the library) |

**Figma only, no Storybook yet?** *A brief → Figma* works from the Figma
manifest alone: the library is the truth, there is no check against code and
no way back yet. See `docs/figma-only.md` in ds-base-ui.

**First check: do the names match?** Pick three components and compare a
Figma property with its prop in code. `variant=primary` in Figma must be
`variant="primary"` in code. If Figma says `Size=Medium` where code says
`size="md"`, stop: this skill reads names, not intentions. Bring the Figma
library in line with the code first (in ds-base-ui: the `figma-library-from-code` skill).

**Your own key map.** A duplicated library gets new keys. Run
`snapshot.figma.js` in *your* library file (through the Figma Console MCP)
and save the result as your Figma manifest, or Claude will look for
components in someone else's file.

## Before you start

1. **Ground yourself** (CLAUDE.md): the Storybook manifest (or the Storybook
   MCP) for components and props; `figma/manifest.json` for the Figma side;
   `docs/layout.md` for the layout words.
2. **Keys, not search.** Every component, variant, text style and variable
   you place is looked up in `figma/manifest.json` → `keys`. Never list or
   search the library to find one (that cost ~59k characters on 2026-09-23;
   the lookup costs a few lines). A missing key means the snapshot is stale:
   say so.
3. **Sync status, live if you can.** `figma_list_open_files` first. If the
   library file is connected, run `snapshot.figma.js` in it and compare the
   result with `figma/manifest.json`. If it is not connected, ask once: "Open
   the library in Figma and run the Desktop Bridge plugin to check live, or
   build from the snapshot of <date, time>?" and name what that snapshot's
   status says. Then report: every ✗, what to do about it, and ask yes or no
   (save the new snapshot? fix it? build anyway?). Change nothing, in Figma
   or in the repo, before a yes. Never build without saying which of the two
   (live or snapshot) it was.
4. **Figma.** The **target** file (the Playground) must be connected; the
   library file is only needed for the live check. Place new work in a
   Section below everything on the page (`section(name)` in the helpers), never
   on top of someone's frames. A failed call can leave half-built layers:
   remove them before retrying.
5. Read `figma/GAPS.md` so a known difference is not reported as new.
6. Load `figma-helpers.js` from this folder and paste it at the top of every
   `figma_execute` call.

## Storybook → Figma

1. **Read the story**: its source, its data file, its pattern CSS. One Figma
   screen per story or state (Tour, Book, Confirm, Booked).
2. **Map before building.** A table: each JSX component → its Figma component
   and options, from the two manifests. Anything with no Figma component
   (a top bar, a text block, `Form`) becomes a plain frame named
   `GAP: <what>`. For more than one screen, show the table first.
3. **Build one screen per call**, 1280 wide unless the story says otherwise:
   - instances by key, options and texts set by their code names (`props`),
     exposed nested instances set too (Card's buttons, Fieldset's fields);
   - layout from the pattern CSS, or from `docs/layout.md` → Page anatomy,
     as vocabulary frames (`layout('Stack', 'space/6')`), every gap and
     padding bound;
   - text only with whole library text styles; colours only with variables.
4. **Never detach, never resize a layer inside an instance.** If an instance
   cannot show what the story shows (the Meter bar is not a property), leave
   it and list it under 🔴.
5. **Overlays**: a dialog sits over a copy of its screen, on a backdrop
   rectangle filled with `color/background/overlay`; a toast sits bottom-right,
   `space/4` from the edges.
6. **Prototype connections**, always: every click in the story that changes
   screen becomes an *On click → Navigate* (dissolve, 200 ms); the first screen
   is a flow starting point named after the story. Check them afterwards by
   reading them back.
7. **Annotations** (Figma's native ones) on elements whose behaviour Figma
   cannot show: validation, a value computed from data, what a toast is
   triggered by.
8. **Verify**: screenshot each screen and the story at the same width. Fix
   your mistakes; list the component's.
9. **Notes frame** beside the flow — see *The notes* below.

## A brief → Figma (no story yet)

When the user describes a screen instead of pointing to a story ("build a
checkout in Figma"), the source is the brief. The rules are the same as
above; only steps 1–2 change.

1. **Build it the way the code builds pages.** A brief says *what*; the
   codebase says *how*. Before planning, read:
   - `docs/layout.md` → **Page anatomy**: the shell, the width, the gaps
     between sections, the page header, columns, forms, overlays, and which
     text style is for what;
   - `src/patterns/`: if a pattern already does what the brief asks (a
     settings page, a sign-up form, a data table), start from it — compose
     downward, as CLAUDE.md says;
   - the code manifest: pick components by what they are for, with their
     real props and defaults;
   - the **descriptions in the Figma manifest** (`components[].description`,
     the text of Figma's description box): what each component is for, and
     its *Use when / Don't use when* if the team wrote one. When two
     components could fit, this decides — not the name;
   - CLAUDE.md's rules: semantic tokens, whole text styles, wrap, don't
     rebuild.
   Neutral demo content: fictional names, `example.com` emails.
2. **Show the plan before building**: one screen per step of the flow, and for
   each the anatomy with layout words, components with their options, and
   text styles, e.g.
   `Page › Page header (heading-xl, body-md) › Columns · space/8 › Stack: Card
   (elevated), Button (primary)`.
   Say which pattern or anatomy rule each part follows. Anything the brief
   needs that no component covers is a `GAP:` frame, named in the plan.
   **Do not wait for a yes: show the plan and build in the same turn.** The
   designer corrects the result, not the plan. Where the anatomy has no rule,
   pick the nearest token, build it, and list it under 🔴 as a question.
3. Build, connect, annotate, verify and add the notes exactly as in
   *Storybook → Figma* steps 3–9. The notes start with "Source: a brief".
4. Offer the way back: the screens can come into Storybook with
   *Figma → Storybook*, so the design exists in code too.

## Figma → Storybook

1. **Read the frame**: for every instance its library component (not the
   layer name) and its properties, exposed nested instances included; every
   text with its style; every frame with its auto layout and bound variables.
2. **Check it is the system**: an instance whose component is local, not in
   the manifest, or detached is not a system component. List it under 💡;
   build the nearest real thing only if the user agrees.
3. **Layout pass** (`docs/layout.md`): a frame named with a layout word is
   taken at its word. An unnamed one gets a proposal, e.g. *"Frame 1 → Grid · 3,
   gap 47 → space-12 (48)?"*. **Show all proposals and wait for a yes** before
   writing code; afterwards rename the frames in Figma so the next round trip
   needs no question.
4. **Values**: a number with no token snaps to the nearest token and is listed
   as a swap. Text that looks like sample copy is carried over and marked
   `PLACEHOLDER`.
5. **Updating an existing story?** Ask: replace the screen, or add it as a new
   story beside the old one.
6. **Write the code** by CLAUDE.md's rules: components from the manifest,
   pattern classes reused where they fit, a comment naming the Figma frame,
   data in the pattern's data file. On `design`.
7. **Check**: `npx tsc -b --noEmit`, `npm run lint`, `npm run validate`, then
   the story in Storybook next to a Figma screenshot at the same width.
8. **Notes** on the story's docs page — see below.

## The notes (both directions)

Every run ends with the same four sections, as numbered lists. In Figma a
notes frame beside the flow (text styles and variables only); in Storybook
the story's docs description.

1. **✅ Real library components**: per screen, which components with which
   options.
2. **🟠 Built by hand (vibed)**: every `GAP:` frame and hand-set text, and why
   no component covers it.
3. **🔴 Where Figma does not match Storybook**: what an instance cannot show,
   drift found in a component, swaps (47 → 48).
4. **💡 Components worth suggesting (not built)**: what kept being built by
   hand (the top bar), what a designer reached for that does not exist.

Start with one line on the source and the direction ("Source: Storybook ›
Prototypes / Booking flow. Four screens, every component a library
instance.").

## Write it down

- A component that looks wrong or cannot do what a screen needs: an entry in
  `figma/GAPS.md` → *Status, open points and uncertainties* (on the branch
  where that section is), and in the notes.
- Anything not checked (a width not compared, a screen not screenshotted):
  say it in the notes and in the reply.

## Stop and ask

- A component is ✗ in Sync status, or has no key.
- The layout pass has proposals (always wait for a yes).
- The design needs a component that does not exist.
- Replacing an existing story or Figma screen.
- The target file is the library file.
