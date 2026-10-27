# Design system rules: the rulebook

Every rule this skill follows, with where it comes from. SKILL.md says *when* to apply
them; this file says *what* they are. If a rule here and a habit disagree, the rule wins.
If two rules disagree, write the choice in `docs/decisions.md`.

Sources, and how each was checked (2026-10-27):
- **Brad Frost**: Atomic Design (book), and his lesson "Keep AI on the Rails of Your Design
  System" (AI & Design Systems course with TJ Pitre and Ian Frost).
- **TJ Pitre / Southleft**: "What does AI-readiness mean in design systems?" and "AI
  Proposes. The Design System Disposes." (southleft.com, southleft.substack.com), read today.
- **Nathan Curtis / EightShapes**: his articles on token naming, space, component API and
  documentation. Summarised from what I know, not re-read today.
- **Derek Wood**: "On Type Patterns and Style Guides" (CSS-Tricks, 2021), and his reply in
  a design system Slack thread (2026-10).
- **Christine's course** (AI Design Systems, Maven): code is the source, GAPS.md,
  components as data, deterministic and probabilistic checks.

Rules are paraphrased, not quoted.

## 1. Source of truth and structure

1. **Code is the source of truth.** Tokens and components live in code; Figma, docs and
   manifests mirror it. *(Christine; Brad)*
2. **One truth in one place; everything else points to it or is generated from it.**
   tokens.json → CSS, docs tables, Figma variables. Components → manifest. Never keep two
   copies by hand. *(Pitre)*
3. **Make the correct state the only possible state**: generate, don't sync. *(Pitre)*
4. **Separation of concerns**: tokens decide values, layout decides placement,
   components decide one job each, content lives in data files. *(Pitre; CUBE CSS)*
5. **Layers of reuse**, smallest to largest: tokens → layout primitives → components
   → patterns/recipes → templates → pages. *(Brad, Atomic Design: atoms, molecules,
   organisms, templates, pages; the names are optional, the order is not)*
6. **Templates and pages compose; they don't style.** A missing style is a missing
   component or variant. *(Brad; validated by the skill's checks)*

## 2. Tokens

7. **Three tiers**: primitive (values) → semantic (purpose) → component (one
   component's knobs, only when needed). Components use semantic or component tokens,
   never primitives, never raw values. *(Brad's Eddie tokens: definitions, usage,
   components; Curtis)*
8. **Names are built from a fixed order of parts**, the same everywhere: category, then
   concept/purpose, then property, then variant, then state:
   `color-text-muted`, `color-action-primary-background-hover`, `space-stack-lg`.
   Don't put values in semantic names (`text-grey-500`). *(Curtis's token taxonomy)*
9. **Space has three kinds**: inset (inside), stack (between rows), inline (within a
   row). *(Curtis, "Space in Design Systems")*
10. **No ghost tokens**: only tokens that exist; a validator rejects unknown names.
    *(Pitre)*
11. **Modes for things that change by context** (breakpoint, theme), the same mode
    names in code and Figma. *(Christine; Figma variable modes)*
12. **Contrast is enforced by a check, not by eye.** *(Pitre: "the solver disposes")*

## 3. Components

13. **One job per component.** Same job → one component with variants; same look,
    different job → separate. *(Brad; GOV.UK)*
14. **Find the jobs, not the looks; model the content first.** The full method is
    `components.md`.
15. **The API uses one vocabulary across the system** (`variant`, `size`, `tone`, `href`,
    `title`, `media`, `actions`), taken from the components themselves, never invented
    per component. *(Curtis on component API; Pitre: vocabulary comes from the catalog)*
16. **Components expose what real use needs.** If a real screen needs a button inside
    a field, the field gets a slot; the gap is fixed in the component, not explained in
    docs. *(Pitre)*
17. **Element and look are separate**: heading level for meaning, text style for look.
    *(Derek Wood; Curtis)*
18. **Accessible by construction**: native elements, required alt and labels, one link
    per card, focus visible, keyboard path tested. *(Inclusive Components; WCAG 2.2)*
19. **Recipes**: compositions the system blesses as *the* way to build a common
    pattern (a contact block, a list of articles). An agent forks a template first,
    then a recipe, then composes components; it builds from primitives last. *(Brad:
    "compose with design system ingredients", pages → recipes → components)*

## 4. Documentation

20. **Every component documents**: what it is for, when to use something else, its
    anatomy (parts), every prop with values and default, its states, accessibility
    notes, and an example per variant. *(Curtis's component specs; GOV.UK)*
21. **Docs are generated where possible** (props from types, token tables from
    tokens.json) and written by hand only where judgement is needed. *(Pitre; Christine)*
22. **Plain words for designers and PMs.** A page someone can read without code
    knowledge: "Use this when…", "Don't use it for…". *(Christine)*
23. **Decisions and gaps are written down**: `docs/decisions.md` (why) and `GAPS.md`
    (what Figma or the code can't do, what was done by hand, what nobody checked).
    *(Christine)*

## 5. AI-readiness

24. **Components as data.** A machine-readable contract: the Storybook manifest
    (`components.json`) in the full skill, a hand-written `components.json` in lean.
    "No list, no AI-ready system." *(Christine; Brad: components.json, tokens.json)*
25. **AGENTS.md stays lean and points to the contract.** No hand-copied component, prop
    or token lists in instructions: they go stale and cause hallucinations. Southleft cut
    about 90% of an AGENTS.md and the benchmark score held, at lower cost. *(Pitre)*
26. **Terminology matches the contract exactly.** One wrong word ("error" where the
    system says "danger") breaks generations. *(Pitre)*
27. **Ground before generating**: the agent reads the live system (MCP or manifest)
    in this session before writing any UI; never from memory. *(Brad: "Stop & ground")*
28. **Progressive disclosure for agents**: a short index first, details on request
    (MCP tools, reference files). *(Pitre)*
29. **Give agents principles, not lists of answers**: the design language (what this
    system values, how dense, how loud) so it can decide new cases. *(Pitre)*
30. **AI proposes, deterministic tools dispose.** Use AI for authoring; use scripts for
    enforcement (validators, contrast, type checks, tests). *(Pitre; Christine:
    probabilistic vs deterministic)*

## 6. Quality gates

31. **The pipeline**: ground → rules → consult the real components → compose →
    validate → render and look → human review → CI gates → human approves. *(Brad's
    nine stations)*
32. **Validate right after generating**: tokens, names, slot contract, accessibility,
    with the fix suggested. *(Brad; Pitre)*
33. **Render and look**: markup that parses can still display nothing. Check the
    result in a browser, not only the code. *(Brad)*
34. **Mechanical checks don't judge design.** Passing tests ≠ good design; a human
    reviews the rendered result. *(Pitre)*
35. **Green is not approval.** A person reads it and decides. *(Brad; Christine)*
36. **Evals**: test the guidance with real prompts and refine it from the results.
    *(Pitre)*

## 7. Governance and feedback

37. **Define what agents may decide** and what needs a person (new components, new
    tokens, changing a variant). *(Pitre)*
38. **What the rails caught becomes a GAPS.md entry or an issue**, so the system learns
    from its use. *(Brad: the feedback loop from shipped products)*
39. **Version and change log** once anyone depends on it. *(Curtis)*
40. **"Don't make a PhD out of it."** The smallest system that does the job, kept up to
    date, beats a complete one nobody maintains. *(Christine; Derek Wood: "a
    well-documented site")*

## How the skills check these

| Rules | Checked by |
| --- | --- |
| 7, 10, 2 | `build-tokens.mjs` (aliases, clashes), `validate.mjs` / `check-css.mjs` (raw values, primitives, unknown tokens) |
| 12 | `check-contrast.mjs` |
| 6, 15, 24 | `validate.mjs` (inline styles, raw img, missing stories); the manifest |
| 18, 32 | Storybook a11y `test: 'error'` + play tests; html-validate + axe (lean) |
| 13–16, 26, 29 | The usability check in `components.md` (a fresh agent builds two screens) |
| 33–35 | The browser comparison and the hand-off review with the person |
| everything else | Judgement: written down in `docs/decisions.md` or `GAPS.md` |
