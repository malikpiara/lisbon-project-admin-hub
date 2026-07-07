# Payload admin teardown — learnings for our `/admin`

A UX/design review of Payload's stock admin (the `/cms-admin` routes), done to mine it
for what it gets *right* before we drop its UI and go headless (Payload as the engine,
our `/admin` as the editor). Reviewed through four lenses:

- **Norman** — *Design of Everyday Things*: the two gulfs (execution / evaluation), affordances, signifiers, constraints, feedback, conceptual models, error prevention.
- **Krug + Nielsen** — *Don't Make Me Think* + the 10 heuristics, with severity 0–4.
- **Wathan/Schoger** — *Refactoring UI*: hierarchy, spacing, type, colour, depth, layout.
- **design-audit** — the 15-dimension screen grid + the reduction filter.

Routes reviewed: dashboard, `services` (list), `services/14` (edit), `topics/140` (article editor), `users/create`, `quick-access/create`.

---

## The one-paragraph thesis

Payload's admin is a **generic, schema-driven CRUD admin**: it is *correct* (real relationships, validation, audit trail) and it *scales* (search, sort, filter, bulk, pagination). But it is **form-first with no preview** — the editor fills boxes and cannot see the thing they're making. Our `/admin` is the inverse: **content-first with live preview**, task-tuned inputs, on-brand — but today it has no persistence, no validation, no scale tools. So the build is not "ours vs theirs." It's: **keep our editing experience (preview + brand + tuned inputs), steal Payload's data-integrity and manage-at-scale affordances.** Payload's gulf of *execution* is narrow; its gulf of *evaluation* for content is wide — and that gap is our whole reason to exist.

---

## Where Payload shines — steal these

Ranked by value-to-effort for our `/admin`. "Value" = how much it helps a real editor (Ana).

| # | What Payload does | Lens | Value | Our `/admin` today | Opportunity |
|---|---|---|---|---|---|
| 1 | **Field hints** — every field carries a one-line description/example ("URL segment, e.g. `family-child-support`", "Copy for the home grid card", "Paragraphs separated by a blank line") | Norman *signifier*; Nielsen #6 *recognition*; Krug *don't make me think* | **High / Low** | Our `Field` already has a hint slot ([field.jsx](components/admin/field.jsx)) — we just don't use it consistently | Write a hint for every non-obvious field. This is the single cheapest UX win; it narrows the gulf of execution for a non-technical editor. |
| 2 | **Manage-at-scale list** — search-by-title, sortable columns, Filters, Columns config, bulk-select checkboxes, pagination ("1–10 of 14") | Nielsen #7 *flexibility*, #6 *recognition*; Krug *scanning* | **High / Med** | Our lists are visual cards — beautiful, but no search/sort/filter and they don't scale | Add search + sort + (later) filter to list views — **Topics first** (140 items; cards there are a scroll-wall). Keep cards for small sets (Quick Access, 14 Services). |
| 3 | **Validation + error recovery** — required `*`, confirm-password double-entry, field-level + server validation, "fix invalid fields" summary | Norman *constraints / error prevention*; Nielsen #5, #9 | **High / Med** | localStorage prototype has none | Adopt when writes go to Payload: inline field errors, required markers, preserve input on failure. |
| 4 | **Unsaved-changes guard** — intercepts navigation when a form is dirty (robust — it blocked even a forced `location.href` change during this audit) | Norman *memory-lapse slip*; Nielsen #5 | **High / Low** | localStorage auto-save made this unnecessary | Once `/admin` writes to Payload (not auto-persisted), add a dirty-form guard. |
| 5 | **Relationship field** — Topic→Service is a removable chip + dropdown + inline "create new" `+`, not a free-text slug | Norman *constraint*; Nielsen #5 *error prevention* | **Med / Med** | We pass a slug string | Model Topic→Service as a real relationship: a Service picker, not a typed slug. Kills a class of "broken link" slips. |
| 6 | **Array fields: drag-reorder + Collapse-All/Show-All + per-row `⋮`** | Norman *affordance/feedback*; Nielsen #8 *manage complexity* | **Med / Med** | Our section editor adds/removes but reordering + collapsing is weaker | Add drag-reorder + collapse to the article-section editor — the 5-section articles get long. |
| 7 | **Audit metadata** — "Created … / Last Modified …" on every doc | Norman *system state*; Nielsen #1 *visibility* | **Med / Low** | None | Trivial once on a real DB; builds editor trust ("did my edit save?"). |
| 8 | **Sticky Save bar** — Save + overflow stay pinned while you scroll a long form | Norman *narrow the gulf of execution*; Nielsen #1 | **Med / Low** | Save status exists; verify it's always reachable on the long article editor | Pin save/state on the article editor. |
| 9 | **Overflow `⋮` for secondary/destructive actions** — Save stays the one prominent primary; Delete/Duplicate/API tuck away | Refactoring-UI *hierarchy*; Nielsen #8 *minimalism* | **Low / Low** | Our actions are flatter | One primary (Save) + a `⋮` for the rest. |
| 10 | **Breadcrumb + live doc title** — `Topics / Parenting Tips`; the H1 updates live as you type the title field (`useAsTitle`) | Krug *trunk test*; Norman *feedback* | **Low / Low** | We have breadcrumbs | Keep; consider the live-title echo. |

---

## Where Payload is weak — and where `/admin` already wins (keep + lean in)

| # | Payload's weakness | Lens | Why `/admin` is better | Action |
|---|---|---|---|---|
| 1 | **No live preview — the big one.** The article editor is heading/lead/body/bullets as separate boxes; the editor *cannot see the rendered article*. They author blind and must open the public page in another tab to check. | Norman: **wide gulf of evaluation**; Krug *don't make me think* | Our shared-store `/admin` renders the article **live as you edit** | **This is our moat — double down.** When headless, keep a live preview driven off Payload draft data. Never ship a blind form for editorial content. |
| 2 | **Bullets-as-array friction** — each bullet is its own draggable, collapsible row; 5 bullets = 5 "Add" clicks + 5 panels | Krug *get rid of half the clicks*; Nielsen #8; "structured ≠ better UX" | Our single **textarea, one bullet per line** is dramatically faster | Keep the textarea in `/admin`; map string ⇄ Payload's `{text}[]` at the data boundary. The "correct" model is the worse editing UX here. |
| 3 | **Generic, dense chrome** — uniform tables, system-grey, no visual identity or scannable shape | Refactoring-UI *hierarchy/brand*; design-audit *density* | Our card dashboards are on-brand and scannable for small N | Keep visual cards for Services / Quick Access dashboards. |
| 4 | **Deep-nesting overwhelm** — Sections → Bullets nests deep; the form becomes a long scroll that *needs* Collapse-All to be usable | Nielsen #8; design-audit *reduction filter* | A preview-driven editor stays calmer (you edit against the output, not a tree) | Favour preview + flatter inputs over ever-deeper field trees. |
| 5 | **Weak primary-action signifier** — "Create New" is a small green **text link**, not a button | Refactoring-UI *hierarchy* (primary = filled button); Norman *perceived affordance* | — | `/admin` should use a prominent **`+ New`** button, not a link. |
| 6 | **Mild jargon / techy leaks** — `[Untitled]` placeholder, "API" tab, slugs surfaced front-and-centre | Krug *plain language*; Nielsen #2 *match real world* | We can speak the editor's language | Hide/soften technical scaffolding for non-technical editors. |

---

## Lens scorecards (Payload's stock admin)

Scored 0–10 per each skill's rubric, *for editorial content work* (its sweet spot is developer-facing CRUD, where it'd score higher).

| Lens | Score | Strengths | The gap holding it back |
|---|---|---|---|
| **Norman** (discoverability / understandability / error-prevention) | **8** | Strong affordances, constraints, feedback, error prevention; narrow gulf of *execution* | Wide gulf of **evaluation** for content — you can't tell what the article will look like |
| **Nielsen** (10 heuristics) | **8** | #1 status, #3 control, #4 consistency, #5 error-prevention, #6 recognition, #7 flexibility all strong | #2 match-real-world (a form ≠ the article the editor pictures); #8 minimalism (dense/generic) |
| **Krug** (don't make me think) | **7** | Self-evident labels, trunk-test passes (logo/breadcrumb/title) | Authoring an article *makes you think* — and the bullets array makes you click |
| **Refactoring-UI** | **7** | Good spacing, type restraint, colour discipline, label-value hierarchy | Generic chrome, weak primary-action emphasis, dense tables |

The pattern: Payload is **excellent infrastructure with an admin tuned for developers managing data**, not for an editor crafting a page. Exactly the seam we're exploiting.

---

## Route notes (raw observations)

- **Dashboard** — collection cards grouped CONTENT / ADMIN. Fine, but it's a router, not a workspace; our `/admin` dashboard already does more (counts, "edit the home page", live-vs-draft framing).
- **`services` (list)** — the manage-at-scale toolkit (search/sort/filter/columns/bulk/pagination). Weak `Create New` link. Whole-row isn't clickable — only the title link is (missed affordance).
- **`services/14` (edit)** — field hints, required markers, audit metadata, Edit/API tabs, `⋮` overflow, Intro as a drag-reorderable collapsible array. The reference for "a serious edit form."
- **`topics/140` (article editor)** — relationship field (Service chip + inline-create), Tone *select* (constrained), nested Sections→Bullets arrays, Collapse-All, sticky Save. Powerful and *correct* — and the clearest demonstration of the no-preview gulf and the bullets-array friction.
- **`users/create`** — auth fields grouped in a panel, confirm-password, `[Untitled]`→live title echo as you type email. Clean create pattern.
- **`quick-access/create`** — same create pattern; simple fields (title/description/href/external/order). Unsaved-changes guard actively blocked navigation away — a strong error-prevention signal.

---

## Prioritised opportunities for `/admin` (phased)

**Phase 1 — do these while building the headless `/admin` (highest editor value):**
1. **Keep + strengthen live preview** — our differentiator; design the headless editor around it.
2. **Field hints everywhere** — use the existing [`Field`](components/admin/field.jsx) hint slot.
3. **Validation + required markers + unsaved-changes guard** — on Payload-backed writes.
4. **Search + sort on the Topics list** (140 items) — keep cards for small collections.
5. **Topic→Service as a relationship picker**, not a typed slug.

**Phase 2 — refinement:**
6. Drag-reorder + collapse on article sections.
7. Sticky save/state on the long article editor.
8. Created / Last-modified metadata.
9. Prominent `+ New` button (not a text link).
10. Primary Save + `⋮` overflow for secondary/destructive actions.

**Phase 3 — polish / only if scale demands:**
11. Bulk actions, column config, filters on large lists.
12. Keyboard shortcuts / `Cmd-K`; live doc-title echo.

**Explicitly keep (do NOT copy Payload):** the no-preview form; bullets-as-array; generic chrome; deep field nesting. Our textarea-per-line, card dashboards, and live preview beat them.
