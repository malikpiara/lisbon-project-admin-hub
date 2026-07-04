# Architecture & Notes

Companion to the [README](../README.md). Read this before editing data flow, the
design system, or the mock CMS — several things here are non-obvious and have
bitten us before.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind v4 · Base UI primitives ·
`shadcn` (base-nova). The public site is still a localStorage prototype (below);
the chosen CMS is **Payload on Supabase Postgres** (see CMS-EVALUATION.md).

- `app/(frontend)/(site)` — the public site (home, services, article, calendar)
- `app/(frontend)/admin` — the mock CMS (localStorage; still feeds the public site)
- `app/(frontend)/components` — the design-system gallery (`/components`)
- `app/(frontend)/payload-demo` — server-rendered read demo (Payload Local API)
- `app/(payload)` — **the CMS**: Payload admin + API (`/cms-admin`, `/api/*`), on Supabase Postgres

The app lives under a `(frontend)` route group with its **own root layout**, so
the `(payload)` group can supply another root layout (Next 16 allows multiple
root layouts only when there is no top-level `app/layout.js`). All public URLs
are unchanged. The Sanity evaluation spike (`(studio)`, `sanity-demo`) was
removed after the decision — see [CMS-EVALUATION.md](./CMS-EVALUATION.md).

> Heed [AGENTS.md](../AGENTS.md): this is not the Next.js in your training data.
> Read the relevant guide in `node_modules/next/dist/docs/` before writing
> Next.js code.

## Data flow — read this first

There is **one** content store. `AdminProvider` (`lib/admin-store.js`) wraps the
**entire `(frontend)` app** in its root layout (`app/(frontend)/layout.js`), so
the public site and `/admin` share it. (The `(payload)` group has its own root
layout and does **not** use this store — Payload reads Supabase Postgres.)

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

Each topic can carry an `article`:
`{ heroLead, keyLinks[], sections[], faqLead, faqs[] }`.

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
- `keyLinks` = `[{ label, href }]`, rendered by
  `components/services/key-links.tsx` as the **first** content block on the
  article (decided 2026-07-04, matching the old site's hierarchy). `/path`
  hrefs navigate internally; `https://` hrefs open in a new tab.

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
  (`rose`/`teal`/…) are **standard Tailwind palette names** stored per
  service/topic, but the public service cards use a uniform mint tile
  (`bg-secondary`). They drive only the admin swatch/dots (used directly as
  Tailwind colours) — there is **no** `lib/admin-tones.js` hex map (that file
  does not exist). Choosing a tone changes the admin swatch, not the public card colour.
- **Colour tokens are a 3-layer, mode-aware system** (`app/globals.css`):
  primitives (`--brand-*`, `--neutral-*`, `--project-*`, `--green`/`--red`) →
  semantic roles (`--brand-primary`, `--bg-*`, `--text-*`,
  `--positive`/`--negative`) → shadcn aliases (`--background`, `--card`,
  `--primary`…). The `.dark` block restates **only** the primitives and the roles
  that remap; the shadcn aliases are pure `var()` chains, so they re-resolve
  automatically. Build with tokens, never a pasted hex. **Dark mode is fully
  defined but not wired to a toggle yet.**
- **The `/components/colors` reference is copy-first and reads live values.**
  Swatches (`color-grid.tsx`) paint from `var(--token)` and read the resolved hex
  back with `getComputedStyle` (an `IntersectionObserver` re-reads when the
  collapsed component-token disclosure opens). Click copies the hex, ⌥-click
  copies the CSS variable, and each swatch's hover tooltip shows both plus
  best-text contrast. There is **no** per-swatch WCAG badge — "best of
  black/white text" is mathematically always ≥4.58:1 (≥AA), so it could never
  flag; contrast guidance lives in the tooltip + the Accessibility doc section.
- **Doc pages branch by category.** `component-doc-page.tsx` renders foundation
  docs (`category === "Foundations"`) without the props-table "API Reference";
  Colors supplies `guide` (How to use, Accessibility) + `previewSections`
  (palette ToC) instead of the generic Installation/Usage/Composition.
  `components/ui/tooltip.tsx` is a new Base UI wrapper (inverted dark chip that
  auto-adapts to dark) reused app-wide.

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

## Pre-release review — revisit before shipping

Surfaced while reworking the colour tokens and the `/components/colors`
reference. None block the current spike, but each wants a decision before a
public release.

- [ ] **DS cross-mode inconsistencies (owner: Rafael).** The Figma exports are
  faithful but internally inconsistent between Light and Dark:
  `chatbot/background` is `#F57600` (light) yet `brand-600` (dark);
  `social-care` shifts orange→red and `community-life` red→magenta across modes,
  while the other three programme areas keep their hue. Confirm these are
  intentional or fix at source.
- [ ] **Legacy / off-DS tokens to clean up** (`app/globals.css`). Remove the
  one-off aliases `--bg-water` (#90DAEC), `--brand-yellow`, `--brand-yellow-soft`
  (~1 use each). Map the off-token values `--secondary-foreground` (#155E57) and
  `--muted` (#E8F6F4) to real DS tokens once Button/Tag are built (both carry a
  TODO in the file).
- [ ] **Dark mode has no toggle.** Tokens are defined in `.dark` but nothing
  switches it. When a toggle lands, the `/components/colors` swatches must re-read
  their hex on theme change — they currently read at mount/visibility, not on a
  class change.
- [ ] **`color-tokens.ts` is light-only.** The 208 component tokens map to their
  light references; chatbot, breadcrumb divider and card-service point at
  different primitives in dark, so that section is accurate in light mode only.
  It also mirrors a Figma typo (`card-service.iconbackgorund`) deliberately to
  stay 1:1 with source — fix upstream first, then here.
- [ ] **Accessibility note.** ⌥-click (copy CSS variable) is mouse-only; the
  primary hex copy is keyboard-accessible. Acceptable for a contributor docs
  page, but worth a keyboard path if this ships wider.
- [ ] **Strict build.** Pre-existing TS errors in `components/ui/chart.tsx`
  (recharts typings) are unrelated to this work but will surface in a strict
  `next build`. Verify the deploy build before release.
- [ ] **Test data.** 4 leftover "New card" Quick Access rows (ids 10, 12, 13, 14)
  remain in the DB from add-card testing — delete before release.
- [ ] **Follow-ups (not blockers).** The colours page is Direction A
  (copy-first). Direction C (role-first ordering) and Direction B (a global
  component search) are designed but unbuilt. The other foundation docs
  (Typography/Radii/Icons) still use the fallback Installation/Usage/Composition
  and could take the How-to-use/Accessibility treatment.
