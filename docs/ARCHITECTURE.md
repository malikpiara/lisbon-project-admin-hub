# Architecture & Notes

Companion to the [README](../README.md). Read this before editing data flow, the
design system, or the mock CMS — several things here are non-obvious and have
bitten us before.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · Base UI primitives ·
`shadcn` (base-nova). Static prototype, no backend.

- `app/(frontend)/(site)` — the public site (home, services, article, calendar)
- `app/(frontend)/admin` — the mock CMS
- `app/(frontend)/components` — the design-system gallery
- `app/(studio)` — embedded Sanity Studio (`/studio`) — **evaluation spike**
- `app/(payload)` — Payload admin + API (`/cms-admin`, `/api/*`) — **evaluation spike**

The app lives under a `(frontend)` route group with its **own root layout**, so
the `(studio)` and `(payload)` groups can each supply another root layout (Next
16 allows multiple root layouts only when there is no top-level `app/layout.js`).
All public URLs are unchanged. See [CMS-EVALUATION.md](./CMS-EVALUATION.md) for
the Sanity-vs-Payload comparison those two groups exist to support.

> Heed [AGENTS.md](../AGENTS.md): this is not the Next.js in your training data.
> Read the relevant guide in `node_modules/next/dist/docs/` before writing
> Next.js code.

## Data flow — read this first

There is **one** content store. `AdminProvider` (`lib/admin-store.js`) wraps the
**entire `(frontend)` app** in its root layout (`app/(frontend)/layout.js`), so
the public site and `/admin` share it. (The `(studio)` and `(payload)` CMS
groups have their own root layouts and do **not** use this store.)

- State seeds from `defaultAdminData` (`lib/admin-default-data.js`), persists to
  `localStorage["lp-admin-data-v1"]`, and is re-read on mount.
- The public home, service, and article pages are **client components** that
  read this store via `useAdmin()`. They are **not** statically-rendered
  content: the static HTML shows the seed defaults, then hydrates to whatever is
  in localStorage.
- **Consequence:** editing in `/admin` **does** change the public pages **in the
  same browser** (shared localStorage). A fresh browser / another visitor sees
  the seed defaults. Older copy that called `/admin` "isolated" is wrong — it
  is a same-browser live preview, not an isolated draft.

### Two seed sources — don't confuse them

| Source | Used by | For |
| --- | --- | --- |
| `lib/services-data.js` | `generateStaticParams` / `generateMetadata` (server) | which slugs/topics exist, page `<title>` |
| `lib/admin-default-data.js` | the client store (seeds from `services-data.js`) | the content actually rendered |

The rendered content comes from the **client store**, not directly from
`services-data.js`. Static params/metadata can therefore differ from edited
content.

## Mock article body (the "headless CMS")

Each topic can carry an `article`: `{ heroLead, sections[], faqLead, faqs[] }`.

- It is **undefined until first edited.** `lib/article-defaults.js`
  `defaultArticle(topic)` supplies fallback placeholder content;
  `ArticleView` renders `topic.article ?? defaultArticle(topic)`.
- The topic editor (`/admin/services/[slug]/[topic]`) writes the whole article
  back via `setTopicArticle` — so the first edit **materialises** the default
  into the store.
- `section.body` = paragraphs (blank-line separated); `section.bullets` = one
  item per line; `section.cta` = optional button label; the panel background
  alternates by index. The hero subheading is now **per-topic** (it used to be a
  single shared constant).

## Design-system gotchas

- **Radius scale is non-standard** (`app/globals.css`): `rounded-lg`=16px,
  `rounded-xl`=24px, `rounded-2xl`=32px, `rounded-3xl`=**56px**. Content cards
  are **16px** (`rounded-lg`); the DS `Card` is `rounded-lg`. Do **not** use
  `rounded-3xl` on cards — that is 56px and reads as a bubble.
- **`cn()` registers custom font sizes with tailwind-merge** (`lib/utils.js`,
  `extendTailwindMerge`). `text-ds-*` are custom font-size utilities; without
  registering them, twMerge groups `text-ds-*` with colour utilities and
  silently drops one (this once turned button labels dark). Keep the
  registration if you touch `cn`.
- **`tone` is not rendered as colour on the public site.** Tones
  (`rose`/`teal`/…) are Tailwind palette names stored per service/topic, but the
  public service cards use a uniform mint tile (`bg-secondary`). The admin shows
  tone as a colour swatch via a **separate hardcoded hex map**
  (`lib/admin-tones.js`). Choosing a tone changes the admin swatch and small
  dots, not the public card colour.

## Known inconsistencies / things to be aware of

| # | Item | Status |
| --- | --- | --- |
| 1 | `/admin` is **not** isolated from the public site (shared store). README + the admin dashboard copy that imply isolation / "live site reads seed data" are imprecise. | Documented; copy to revisit |
| 2 | Public service cards ignore the `tone` colour (uniform mint tile). | Intended for now; resolve if tone should drive the public colour |
| 3 | `legal-assistance` reuses `family-child-support`'s topic list, and `legal-assistance-2` is a near-duplicate service. | Seed-data placeholder |
| 4 | Contacts, article sections, and FAQs use the array **index** as their React key (no stable id) — deleting a middle item can hand its collapsible open-state to a neighbour. | Acceptable for the mock; needs stable ids for production |
| 5 | Deletes are a two-step inline confirm, **not** true post-action undo (no toast system). Recover via the Reset / Reset-article buttons. | By design |
| 6 | The "Where we are" map is a Google Maps **iframe embed** (no API key) — it renders blank in headless screenshots or where embeds are blocked. The Calendar API key is unrelated. | Expected |
| 7 | Navigation (breadcrumb / main-menu / footer / list-item) and Sections (contact / grid / header / text) are **not** fully audited against Figma. The header menu button is fixed; the rest is outstanding. | Outstanding |
| 8 | Infobox border (`border-2 border-brand-link`) contradicts the `infobox/border` token (#0d635d). | Pending a designer call |
| 9 | The public pages are client-rendered from localStorage (hydration gap; not true SSG). | Architectural, by design for the prototype |
