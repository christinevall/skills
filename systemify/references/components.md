# Components: deciding what they are, and making them easy to use

Read this before building any component, in both skills. It is the method a good
front-end developer follows when someone hands them a page: **find the jobs, not the
looks; model the content first; give each component the smallest API that covers
what the page really does.** The goal is a system a designer can read and an agent
can use without guessing.

## 1. How a good developer reads a page

They don't start with "this is a card". They ask, for every repeated piece:

1. **What job does it do for the reader?** "Points to an article", "shows a past talk",
   "sells a service". Same job → probably one component. Same look, different job →
   maybe two.
2. **What content does it carry?** Title, date, image, a few lines of text, links. This
   is the content model. It decides the props.
3. **What is its skeleton?** The parts in order (media, kicker, title, meta, body,
   actions). Same skeleton → one component.
4. **What really differs?** Missing parts, a different look of one part, a different
   arrangement. Each kind of difference has its own answer (section 3).
5. **Whose job is the layout?** Width, columns, spacing between cards: the parent
   (Grid, Stack), never the card.

A page built in a visual tool (Figma Sites, Framer, Webflow) usually has no components
underneath, or components per breakpoint frame. Three cards that look alike may be three
hand-made copies that drifted. Treat small differences as drift until they repeat.

## 2. The comparison table (do this for every family of similar things)

Collect every instance (all pages, all breakpoints) and fill one table per family. Put
it in `docs/audit.md` with a screenshot of each instance.

| Instance (page, where) | Media | Kicker | Title | Meta | Body | Tags/badge | Actions | Arrangement | Look differences |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home, "Recent work" #1 | image 3:2 | – | heading-sm, link | – | 1 line | – | "Read more →" | image above | – |
| Work, grid | image 3:2 | category | heading-sm, link | – | 2 lines | – | – | image above | title 2px larger |
| About, "Press" | logo 1:1 | – | heading-sm | date | – | – | link | image left | – |

Columns are the parts. A cell says whether it is there and how it looks. Then read the
table, top to bottom, with the rules below.

## 3. Merge or split: the rules

| What the table shows | Decision | Example |
| --- | --- | --- |
| Same parts, same order; some parts missing in some instances | **One component, optional parts.** Leaving a prop out removes the part. | Card with or without an image |
| Same skeleton; one part looks different, and the difference repeats and has a reason | **One component + a variant** (`variant`, `size`, or `ratio` for media) | A "featured" card that is larger |
| Same skeleton; a part differs slightly once (2px, a near-identical grey, a different ratio on one card) | **Drift: normalise it**, write "merged: …" in the audit | Title 2px larger on one page |
| Same parts; only the arrangement differs (image above vs. beside) | **One component; arrangement is either a single `layout` prop or the parent's job.** Prefer the parent (Grid/Col decides width; the card only stacks). Add `layout="horizontal"` only if the inner arrangement really changes. | Press item with logo on the left |
| Different job and different content model | **Separate components**, even if they look alike | A product card and a person card |
| Seen once | **Not a component.** A section on that page, built from layout + existing components | One hero block |

**Rule of three:** a component exists when it appears 3+ times, or on 2+ pages, or the
person says it must be reusable. Everything else is composed.

**When in doubt, merge** and add a variant later. Splitting a component later is easy;
merging three that drifted apart is not.

## 4. Nesting: how deep, and how

Nest where a part is something the system already has, or where a part varies in
*kind*. Don't nest where a plain value will do.

| Use | For | Example |
| --- | --- | --- |
| **A typed prop** (string, enum, number) | Simple content and choices | `title="Harbour signage"`, `date`, `variant="featured"` |
| **A slot** (a React node / a pre-rendered block) | A part that can be different kinds of thing | `media={<Image …/>}` or `media={<VideoEmbed …/>}`; `actions={<Button …/>}` or two links |
| **`children`** | The one main free-form area | The body text of a card |

Limits that keep it clean:
- **One level of slots in normal use.** A card holds a button. It does not hold a list
  that holds cards that hold buttons.
- **No compound components** (`<Card.Header>`, `<Card.Body>`, `<Card.Footer>`) in a small
  system. They double what people and agents have to learn and get misordered. Use them
  only if parts must reorder freely, and say why in `docs/decisions.md`.
- **No `showImage`, `hasLink`, `withBadge` booleans.** Leaving the prop out is the switch.
- **No booleans that only make sense together** (`isLarge` + `isFeatured`). Make one enum.
- **Around 7 props is the comfortable ceiling.** Above that, look for a missing variant,
  a slot, or two components hiding in one.

## 5. The API: names and defaults

**One vocabulary across the whole system.** Learn it on one component, use it on all.

| Prop | Means | Values |
| --- | --- | --- |
| `variant` | Which version of the component | `primary`, `secondary`, `featured`… (named by purpose) |
| `size` | How big | `sm`, `md`, `lg` |
| `tone` | Colour role of text | `default`, `strong`, `muted` |
| `textStyle` | Which text style (look) | the text style names |
| `level` / `titleLevel` | Heading level (meaning), separate from look | 1–6 |
| `href` | Makes it (or its title) a link | URL |
| `title`, `description`, `date`, `meta` | Content, named by what it is for the reader | strings |
| `media`, `actions` | Slots | nodes |
| `status` | A badge or label on it | short string or enum |
| `children` | The main content | anything |

- **Defaults are the most common use.** `<Card title="…" href="…" />` must already be right.
- **Required means required:** what the component cannot work without (a title, alt
  text for an image, a label for a button). TypeScript enforces it; the lean contract
  marks it `required` and the style guide shows it.
- **Native names** where HTML has one: `disabled`, `href`, `alt`, `required`, `name`, `type`.
- **Content names, not look names:** `date`, not `boldLine`; `description`, not `greyText`.
- **Accessibility built in, so users can't get it wrong:** heading level separate from
  style; one link per card (the title), not the whole card wrapped in `<a>`; alt
  required; a button always has a name; the component never adds outer margin.
- Variants as data attributes in CSS (`data-variant`), so the look is readable in HTML.

## 6. Base component and presets

Sometimes the content has a fixed shape that repeats everywhere: talks always have
event, date, title, location. Two ways:

- **Base only** (default): one `Entry` with `kicker`, `title`, `href`, `meta`, `children`,
  `actions`, `status`. Pages map their content into it.
- **Base + thin presets:** `TalkEntry` with `event`, `date`, `title`, `location` that only
  maps its fields into `Entry`. **No CSS of its own, no new look.** Worth it when the
  content comes from a JSON or CMS collection with that shape and is used 3+ times:
  typed fields are easier for agents and editors than generic ones.

If a preset needs its own CSS, it is either a variant of the base or a different component.

**Worked example (CVDS, 2026-10):** the first build has five list entries (`TalkEntry`,
`PodcastEntry`, `ArticleEntry`, `ServiceEntry`, `TopicEntry`), each a stack of text lines
with 5–16 lines of CSS. By this method they are one `Entry` (kicker/title/meta/body/
actions/status) plus at most two presets for the collections that come from JSON (talks,
articles). Not changed in CVDS yet; logged in its GAPS.md as a candidate.

## 7. Lean skill: the same rules in Nunjucks

- One macro per component, one `props` object: `card({ title, href, text, image, alt, variant })`.
- The main free-form area as `caller()`:
  `{% call card({ title: "…", href: "…" }) %}<p>Body</p>{% endcall %}`.
- Other slots as a pre-rendered string prop only when really needed (`actions: button({…})`).
  Otherwise prefer a typed prop. Nunjucks makes deep nesting awkward, which is a good limit.
- `components.json` lists every prop with type, values, default, `required`, description,
  and one example per variant. The style guide renders from it, so docs can't drift.

## 8. The usability check (both skills, before hand-off)

1. **One sentence each.** Write what each component is for, in one sentence, and when to
   use another one instead. If you can't, it is two components or a page section.
2. **Pick test.** Give a fresh agent (a subagent) only the docs: the Storybook MCP, or
   `components.json` + AGENTS.md in lean. Ask it to build two screens that are not on the
   site (a contact page and a list page are good). Count:
   - props or components it invented
   - places it guessed between two components
   - places it had to add CSS or inline style
3. Every count above zero is an API problem: fix it (rename, default, merge, document) or
   write it in GAPS.md with the reason it stays.
4. **Designer read.** Open the docs page of each component: is the first story the common
   case? Are the props readable without code knowledge? Is the "when to use something
   else" line there?

Sources for this method (read them, don't quote them blind): Nathan Curtis's writing on
component API and naming (EightShapes), Brad Frost's Atomic Design and his "design
system components" writing, the GOV.UK Design System's component pages (one job, when
not to use it), Heydon Pickering's Inclusive Components (cards: one link per card).
