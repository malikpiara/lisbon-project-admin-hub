# Team feedback, October 2026 — triage and shaping

**Source:** "Demandas de Desenvolvimento" list from the Lisbon Project team
(received 2026-10-04; references Figma DS v10.09.2026 frames `3393:7186` Home
and `3393:7330` Service/Article).
**Status:** research + prototypes on branch `explore/team-feedback-2026-10`.
Nothing here is on `main`. Prototypes run against a local SQLite sandbox, not
production (see *Running the prototypes*).

The list reads as ~45 requests. Underneath there are **six themes and two
bugs**, and the two bugs explain most of the pain the editors describe. This
document is for the prioritisation conversation with the team, not a build
plan: each theme has what we know, what was prototyped, what it would cost to
ship, and what still needs a decision.

---

## 1. What is actually going on (diagnoses with evidence)

### 1a. "Published articles don't appear" is the review flow, not a cache bug

Every article in production is published and reachable: all 61 topics have
`_status = published`, each category page lists its published articles, and the
Cloudflare Worker serves them with `x-opennext-cache: HIT` (checked
2026-10-04 after the cutover).

What editors experience is this: **a non-admin's "Save" is a submission.** It
writes a draft, the live page stays as it was, and nothing goes public until an
admin approves it under *Review*. The audit log shows exactly that pattern:

- 2026-09-29, 14:27: one editor submitted *How to get a NIF* **five times in
  ten seconds**. Nothing on screen confirmed the submission.
- 2026-10-02, 15:46–15:51: Adriane approved **11 queued articles in five
  minutes** — the backlog the team had been calling "published but invisible".

Two things made it worse:

- The editor's "View on site" link uses the *draft* slug, so after a rename it
  404s until approval.
- The review diff only compared the legacy section fields, so a submission
  made in the blocks editor showed as "body deleted". Fixed in an unmerged
  commit (874c85c on `origin/claude/eloquent-hopper-0x0r31`); cherry-picked
  onto this branch.

(The route-group revalidation bug fixed on 2026-07-17 would have produced a
genuinely stale site for five days in July; if the feedback dates from then,
that is a second, historical cause.)

### 1b. Empty "New article" cards on the live site

`createTopic` published the stub immediately, for every role, as a "baseline
for the review flow". So every click on *Add article* put an empty card named
"New article" on the public category page. On 2026-10-02 alone Adriane deleted
**nine** of them by hand. This is the "o artigo só ser publicado quando está
completo" item.

### 1c. Formatting: editors already write the format the site ignores

Measured over the 351 live text blocks in production:

| Pattern typed by editors | Blocks |
|---|---|
| contains a single Enter (rendered as a space) | 189 (54%) |
| contains a blank line (paragraph break, works) | 88 |
| hand-typed numbered lines (`1. `, `2) `) | 22 |
| hand-typed bullets (`- `, `• `) | 10 |
| `**bold**` | 0 |

Links already work via `[label](url)` and bare URLs/emails/phones. There is no
bold, no line break, no list inside a text block, and FAQ answers are rendered
as a single inline run (no paragraphs at all). The composable blocks editor
(text/list/table/button) shipped in July; the table block is fixed at two
columns.

### 1d. Contacts: a single phone and a single email, icons drawn regardless

The contact row rendered the mail and phone links unconditionally, so a missing
email showed a bare icon linking to `mailto:` — the "ícones vazios" bug. The
model has one `phone` and one `email`; two numbers typed into one field become
one broken `tel:` link. No website, socials, address or hours exist.

### 1e. "Logos in the Quick Access boxes"

The card icon and button label were hardcoded **by href**. Edit a card's link
in the admin and its glyph silently became an arrow and its button "Learn
more". That is also why *Add card* was disabled.

### 1f. "All texts editable"

Payload has no globals. Hero title/lead/description, "Services and
Information", "All Contacts" + subtitle, the map/visit block, the footer, the
nav labels and the chatbot copy are all JSX strings. Only Quick Access cards and
service copy (including each service's contacts title/subtitle) are editable.

### Side findings worth a separate look

- `reorderTopics` calls `payload.update` without `draft`, which Payload treats
  as a publish merged onto the *latest* version — reordering a service could
  silently publish a pending editor draft. Not fixed here; verify and fix on
  its own.
- `access.read: () => true` on Topics probably exposes drafts via
  `/api/topics?draft=true`. Not a cause of anything above; a security note to
  verify.
- Local `main` was four commits behind `origin/main` (the font and sitemap
  fixes).
- The "Help us improve" feedback form the team asks for ("área de feedback
  dos utilizadores") **is already designed** in both Figma frames
  (`.form-suggestion`, name/email/message). It has no backend yet.

---

## 2. Triage — every request, where it landed

Effort: **S** ≤ half a day · **M** 1–2 days · **L** 3+ days or a design
dependency. "Proto" = working on the branch.

### Editor (applies everywhere text is typed)

| Request | Where it landed | Effort | Notes |
|---|---|---|---|
| Bold (em tudo) | **Proto** — `**bold**` + Bold button | S | Rendered in bodies, leads, hero, FAQ, lists, tables |
| Clickable links (esp. FAQs) | **Proto** — FAQ answers get the link tool | S | Links already existed in bodies |
| Bullet points (esp. FAQs) | **Proto** — `- ` lines become lists | S | Also inside FAQ answers |
| Enter to split paragraphs | **Proto** — single Enter = line break | S | Blank line = paragraph, as before |
| Tables with more columns | Shaped | M | Table block is 2-col; needs a `columns` array + renderer + editor |
| Quick Access button text editable | **Proto** | S | See Home |
| All texts editable | Shaped (site-settings global) | M | See Home |
| User feedback area | Shaped — design exists in Figma | M | Needs a `feedback` collection or PostHog survey + inbox in /admin |
| Numbers in bold / bigger (steps) | **Proto** — bold teal markers | S | `marker:` styling on ordered lists |
| New spacings (contacts, text boxes) | Open | S | Need the specific values from Rafael's frames |

### Home

| Request | Where it landed | Effort | Notes |
|---|---|---|---|
| Fix menu logo (new layout) | Open — needs the asset | S | Current lockup matches the frame structurally; ask Rafael which node is canonical |
| Editable hero text | Shaped (site-settings) | M | hero title / lead / description |
| Fix Quick Access logos | **Proto** — icon field + DS icon picker | S | Hardcoded-by-href map now only a fallback |
| Editable Quick Access button content | **Proto** — `cta` field; Add card re-enabled | S | |
| Editable section titles | Shaped (site-settings) | M | "Services and Information", contacts heading |
| All Contacts → External Contacts | **Proto** (string) | S | Editable version needs site-settings |
| Update All Contacts table | **Proto** — Figma 3393:7225 layout | M | Columns Organization / Service / Contact / Category / Directions |
| Bigger chatbot button | **Proto** — 50 → 64px | S | Confirm size with Rafael |
| Partner logos area | Open — not designed yet | L | Needs design + a `partners` collection with image uploads (first upload collection in the project) |

### Articles

| Request | Where it landed | Effort | Notes |
|---|---|---|---|
| "Who Can Apply" section title | Already possible — headings are free text | S | Add it to the heading presets |
| Publication date + authoring org | **Proto** — byline, date stamped on first publish | S | Figma 3393:7345 |
| Important Links box | **Proto** — Key links as 3 cards | M | Figma 3805:13877 |
| Key Links / Contacts / Locations per article, optional | **Proto** — cards hide when empty | M | Editor rows are plain (no reorder yet) |
| Documents checklist (future) | Shaped | M | A `checklist` block; or render the Documents table rows with checkboxes stored in localStorage |
| Fix articles published but not showing | **Diagnosed** (1a) + **Proto** feedback | S | Save outcome notice; "Draft · not live" chip |
| Filter contents inside articles (submenu) | Open — not designed | L | Needs IA/design first |
| Publish only when complete | **Proto** — draft-first + completeness gate | S | See 1b; rule in `lib/article-completeness.js` |
| Videos and external resources | Shaped | M | A `video` block (YouTube/Vimeo embed by URL) is cheap; file uploads are the real cost |
| Main menu for easier access | Open — needs design | L | |

### Contacts

| Request | Where it landed | Effort | Notes |
|---|---|---|---|
| All Contacts → External Contacts (editable) | **Proto** string; editable = site-settings | S | |
| Multiple phones / emails | **Proto** | M | Arrays with optional label |
| Websites | **Proto** | — | |
| Instagram + other socials, optional | **Proto** — instagram/facebook/linkedin/whatsapp/other | — | Handle or full URL |
| Address | **Proto** — also drives Directions | — | |
| Opening hours | **Proto** — free text, one line per rule | — | Figma shows it under Service |
| Several locations per org (future) | Shaped | M | Move address + hours into a `locations[]` array when needed |
| Hide icons when info is missing | **Proto** | S | |
| Fix empty icons | **Proto** (same fix) | S | |

---

## 3. What is on the branch

Commits on `explore/team-feedback-2026-10` (on top of `origin/main`):

1. **Sandbox** — `DATABASE_ADAPTER=sqlite` switch so schema prototypes never
   push to the production database. Worth merging on its own.
2. **Review diff fix** — cherry-pick of 874c85c (blocks were invisible to the
   Before/After).
3. **Editor: inline format + publish gate**
   - `components/services/rich-text.tsx`: one renderer for text blocks, FAQ
     answers, table cells and the editor preview. Single Enter → `<br>`, blank
     line → paragraph, `- `/`• ` → bullets, `1. ` → numbered, `**bold**`, links
     as before. Numbered markers are bold teal and one step larger.
   - Text field gains a **Bold** tool and a format hint; FAQ answers get the
     same tools.
   - `createTopic` creates a **draft**; the public adapter reads
     `_status: published` only; untouched stubs are excluded from the review
     queue and its badge.
   - `lib/article-completeness.js`: title ≠ "New article", a description, and
     one section with content. An admin's save publishes only when complete
     (otherwise it is kept as a draft and the editor says why); approving a
     draft applies the same gate; declining a never-published draft is refused
     with an explanation instead of publishing the stub.
   - The editor shows a readiness checklist and a save-outcome strip:
     *Submitted for review* / *Saved as a draft, not published* / *Published*.
     "Pending review" vs "Draft · not live" chips; "View on site" hidden for
     unpublished articles.
4. **Contacts** — the model, editor and table described in §2.
5. **Article byline + three key-link cards** — plus three DS glyphs
   (location, contact-book, clock) exported from the Figma frame into
   `ds-icons.tsx`.
6. **Home** — Quick Access `iconKey` + `cta` fields with the DS icon picker,
   *Add card* re-enabled, chatbot launcher 64px.

Deliberately **not** built: the site-settings global, the feedback inbox,
multi-column tables, video block, partner logos, sub-menu. They are shaped
above and each is a separate decision.

### Running the prototypes

```bash
DATABASE_ADAPTER=sqlite DATABASE_URI=file:./payload.sandbox.db pnpm seed:payload
```

then start the `sandbox-3200` entry in `.claude/launch.json` (or the same env
with `pnpm dev --port 3200`). The seed prints the admin login it creates
(`PAYLOAD_SEED_EMAIL` / `PAYLOAD_SEED_PASSWORD` to choose your own). Restart
the dev server after any collection change — Payload pushes the schema at
start-up. The seed now publishes topics (it used to create 140 drafts).

Note: `pnpm dev` **without** that env still points at production and pushes
schema changes there. Do not run it on this branch.

---

## 4. Suggested order, as hypotheses

Each step is one deploy so its effect can be read on its own.

1. **Editor feedback + draft-first + publish gate.** Hypothesis: duplicate
   submissions and empty public articles both go to zero. Measure: audit log
   (`submitted` bursts per article; `deleted` of "New article").
2. **Inline format.** Hypothesis: the "enter / bold / bullets" requests stop
   and no article needs a re-save. Measure: the 189 single-Enter blocks render
   as line breaks on deploy day; ask two editors to write one article each
   without instructions.
3. **Contacts model + table** (after Rafael confirms the column layout and
   the hours format). Needs a prod schema migration (additive: new tables and
   columns; old `phone`/`email` kept as fallback). Hypothesis: contact rows
   with a second phone/email appear within a week of the editors getting the
   fields.
4. **Byline + key-link cards + Quick Access fields.** Additive schema again.
5. **Site-settings global** for hero/section/contacts copy. This is the "all
   texts editable" theme; shape the field list with the team first so it is a
   small global, not a CMS for every string.
6. **Feedback inbox**, then **video block / multi-column table**, then the
   design-dependent items (menu logo, spacings, partner logos, sub-menu, main
   menu).

---

## 5. Questions for the team (and Rafael)

- **Review flow:** do editors want to *see* the queue state (who is reviewing,
  how long), or is the on-save message enough? Should an editor be able to
  withdraw a submission?
- **Completeness rule:** is "title + description + one filled section" the
  right bar, or should the five standard sections be required?
- **Authoring organisation:** free text (prototype) or a fixed list of partner
  organisations?
- **Opening hours:** free text per contact (prototype, matches the frame), or
  structured days/times (enables "open now", costs editor time)?
- **Directions:** when there is no address, keep the organisation-name search
  (current) or hide the button?
- **Rafael:** canonical node for the menu logo; the table and trash glyphs
  still missing from the DS (docs/DS-ICON-GAPS.md); whether the location /
  contact-book / clock glyphs exported here are the final ones; the "new
  spacings" values.
- **Partner logos:** where on the page, how many, who maintains them?

---

## 6. Risks and loose ends

- Production schema changes in 3–6 are additive but still migrations against
  the live Supabase DB; run them from a backup and via a dry-run, not dev
  push.
- Key contacts/locations editor rows are plain (no reorder/flash); fine for
  validation, not for release.
- The sandbox seed data is Lorem-ipsum; the inline-format behaviour was
  checked with a hand-written fixture, not real articles. Before deploying
  step 2, render the 189 single-Enter blocks from a prod snapshot and eyeball
  a sample. A lone line starting with a number and a dot (e.g. "2. andar")
  stays prose — only two or more consecutive numbered lines form a list —
  but bullets (`- `) are taken literally.
- Pre-existing eslint errors in `article-editor.jsx` (ref access in render)
  are untouched.
- Malik's Mac disk was at 100% during this session; `.next/dev` and
  `.next/cache` were deleted to continue. Builds will need space.
