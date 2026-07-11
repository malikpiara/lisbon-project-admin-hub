# Admin handover — the headless-Payload admin (`/admin`)

**Purpose:** a custom editing UI built on Payload's **headless** engine, meant to
**replace Payload's default admin** (`/cms-admin`) for the Lisbon Project's
non-technical volunteers. Payload stays as the backend (schema, auth, versions,
Postgres); the UI is ours, built from the LP design system.

> **History (2026-06-30):** this admin started life at `/studio` while the old
> localStorage **mockup** editor occupied `/admin`. The mockup was removed and the
> Payload-backed routes moved into `/admin`; `/studio` is now unused. (An even
> earlier Sanity spike also briefly lived at `/studio` — see the superseded
> [PROTOTYPE-HANDOVER.md](./archive/PROTOTYPE-HANDOVER.md).)

> **If you are the Claude reading this:** the `/admin` routes are a working spike
> on branch **`spike-cms-eval`**. Read [ARCHITECTURE.md](./ARCHITECTURE.md) and
> [`AGENTS.md`](../AGENTS.md) first (non-standard radius scale; `cn()` over
> `twMerge`; the public site reads Payload server-side — the localStorage store was
> removed 2026-07-07). Do **not** commit
> secrets (`.env.local` is gitignored). Commits use **no** `Co-Authored-By`
> trailer. The strategic decision (Payload on Supabase Postgres) lives in
> [CMS-EVALUATION.md](./archive/CMS-EVALUATION.md); the teardown that motivated
> this UI is in [payload-admin-teardown.md](./archive/payload-admin-teardown.md).

## How to run

1. `.env.local` needs `PAYLOAD_SECRET` + Supabase `DATABASE_URI` (already set on
   Malik's machine; never print these).
2. `pnpm install` → `pnpm dev`, open `/admin`.
3. **Login:** `/admin` is gated on the Payload session and redirects to
   **`/login`** — the custom DS-styled sign-in (`app/(frontend)/login/`), which
   authenticates against the same Payload `users` collection and sets the shared
   `payload-token` cookie. Dev creds: `malik@roundtwenty.com` / `changeme123`.
   The session **expires over long sessions**; re-login the same way. (The
   Payload-native `/cms-admin/login` still exists and shares the session, but the
   app no longer routes there.)

## How it works (the headless pattern)

- **Reads** happen in **server components** via the Payload **Local API**
  (`getPayload({config})` → `payload.find / findByID / findVersions`). `depth`
  controls relationship hydration (e.g. `depth:1` to resolve `createdBy`/
  `updatedBy` → user docs).
- **Writes** happen in **server actions** (`"use server"`) — `create / update /
  delete / restoreVersion`, then `revalidatePath` / `router.refresh()`.
- **Auth is not inferred** by the Local API. The gate is centralised in
  **`lib/admin-auth.js`** (`authedPayload()` → resolves `{payload, user}`,
  redirects to `/login` if there's no user). It's called by the `/admin`
  layout, every page, and every server action — server actions are public POST
  endpoints, so each must gate independently. Writes stamp `createdBy`/`updatedBy`
  + the audit log explicitly (the Local API won't infer the user).
- The shell (`app/(frontend)/admin/layout.js`) gates the whole group and frames it
  with `AdminSidebar` (`components/admin/admin-sidebar.jsx`) — the single sidebar,
  shared by the content editor and `/admin/insights`.

## What's built

| Area | Route / file | Notes |
|---|---|---|
| Shell | `admin/layout.js`, `components/admin/admin-sidebar.jsx` | Sticky sidebar (`h-dvh`) from `md` up; below `md` a slim top bar + hamburger drawer (same nav markup via shared `SidebarContent`; closes on navigate / Escape / backdrop). Grouped nav (Content / Analytics / Admin), signed-in footer |
| Dashboard | `admin/page.js` | Counts + cards into each editor + Insights |
| Quick Access | `admin/quick-access/` | Editor + reorder + per-card save-state + **unsaved-changes guard** (aggregated across cards) |
| Services | `admin/services/` + `[id]/` | Editor: basics, intro, icon, contacts-page header, topic list (reorder), **version history + diff + restore**. (Contacts + the old per-service category filters moved out — see Contacts.) |
| Contacts | `admin/contacts/` + `[id]/` | **Global contacts directory** — one contact per organization, tagged with the service categories it belongs to (`categories`, many-to-many). List → editor with a category multiselect. The home "All Contacts" table and every category page render from this one list; the category filter == the services. |
| Articles | `admin/articles/` + `[id]/` | Searchable list; editor with **live `ArticlePreview`**, key links + sections + FAQs (reorder/duplicate), required markers. (Payload collection slug stays `topics`.) |
| Insights | `admin/insights/` | Team-only analytics (PostHog); inherits the layout's auth gate + sidebar |
| Team | `admin/users/` | **Admin-role only.** Invite-link flow: creating a member (no password field) mints a single-use link (7-day expiry) the admin sends over any channel; the person chooses their own password on the public `/welcome` page and is signed straight in. "Reset password" mints the same kind of link (3-day expiry); only your *own* password is ever typed directly. Two-tier roles (admin / editor); self-delete + self-demote guards; "You" badge |
| Review | `admin/review/` | **Admin-role only.** Approval queue for Articles: editors' saves become drafts ("Submit for review"); each pending draft shows a whole-article Before/After word diff (`lib/diff-text` + `lib/flatten-topic`); Approve publishes the draft, Decline re-publishes current content (draft kept in version history). Sidebar badge = pending count |
| History | `admin/history/` | Activity feed of every create/update/delete (+ submitted/approved/declined), with who + when |
| Audit | `payload/fields/audit.ts`, `components/admin/audit-meta.jsx`, `lib/format-audit.js` | `createdBy`/`updatedBy` on every collection; labeled meta bar |
| Audit log | `payload/collections/AuditLog.ts`, `lib/audit-log.js` | Append-only; best-effort `logAudit()` from each write action |
| Guard | `components/admin/unsaved-changes-guard.jsx` | In-app "Leave without saving?" modal (beforeunload + capture-phase anchor intercept) on every editor, incl. quick-access |

**UX wins borrowed from the teardown:** live preview (the moat over `/cms-admin`),
the unsaved-changes modal, reorder/duplicate controls, required-field markers,
field hints, and the audit trail with *who*.

## ⚠️ Schema changes were dev-pushed — production needs migrations

The Postgres adapter auto-pushes schema diffs on dev restart. These were added
that way and have **no migration files yet**:

- `ordered` (Topics) + `ctaHref` (Topic sections)
- **`Contacts` collection** (global directory; `categories` many-to-many → Services) **and the removal of `contacts` + `categoryFilters` + `breadcrumb` from Services** (the breadcrumb trail now falls back to the service `title`). Reseed with `pnpm seed:payload` after the push (it now seeds the `contacts` collection and maps each contact's category slugs to service ids).
- `joinedAt` (Users) — set on first sign-in / invite completion; drives the
  Team page's "Invited" status
- `auditFields` (createdBy/updatedBy) on Services, Topics, QuickAccess
- `AuditLog` collection
- `versions: { maxPerDoc: 25 }` on **Services** (versions table `_services_v`)
- `versions: { drafts: true, maxPerDoc: 25 }` on **Topics** (versions table
  `_topics_v` + `_status` column) — powers the review flow
- audit-log `action` enum extended with `submitted` / `approved` / `declined`

**Before any non-dev deploy:** run `payload migrate:create` and commit the
migration. (See [project memory `project_ts_build_strict`] — untyped helpers also
broke deploys before; typecheck before pushing.)

## What's left to retire `/cms-admin`

1. **Custom login — done.** `/admin` now has its own DS-styled login at `/login`
   (`app/(frontend)/login/`, `login/actions.js`) and redirects there, not to
   `/cms-admin/login`. **Password recovery — admin-mediated, no email needed:**
   an admin mints a single-use reset link from the Team page (built on Payload's
   `forgotPassword` token with `disableEmail: true`); the person sets a new
   password at `/welcome?token=…`. Fully self-serve "forgot password" from the
   login page still needs an email adapter — when one lands, the create/reset
   actions can email the same links instead of showing copy buttons, with no
   change to the flow.
2. **Topic → service reassignment — done.** The article editor has a service
   dropdown; `saveTopic` moves the topic to the end of the destination
   service's list and revalidates both service pages.
3. **Slug control.** No way to view/edit a doc's slug in `/admin` yet.
4. Optional polish: my-account page, reorder loading/feedback states, a
   version-history *panel* for Articles/Quick-Access (Articles now record
   versions for the review flow, but only the Services editor renders a
   restore panel), item-level array diffs.

## Still true from the broader project

- **Public read-path (2026-07-07): the public site now reads Payload,
  server-side.** The public pages fetch published content via `lib/content.js`
  (SSG + `revalidatePublicContent()` on admin writes); the localStorage store
  (`AdminProvider`/`useAdmin`/`lib/admin-store.js`) was **removed**. So `/admin`
  edits now reach visitors — the release blocker is closed. `lib/services-data.js`
  + `lib/admin-default-data.js` survive only as the `pnpm seed:payload` seed.
- Gotchas that bit during the build: same-eval preview reads are stale (split
  click + read into separate `preview_eval` calls); `[id]`/`(frontend)` paths need
  `GIT_LITERAL_PATHSPECS=1` for `git add`.

## Git state

Branch `spike-cms-eval`. The `/studio`→`/admin` merge, the `/insights` fold-in to
`/admin/insights`, the auth-gate consolidation into `lib/admin-auth.js`, and the
quick-access unsaved-changes guard landed in `refactor(admin): merge /studio into
/admin, fold in insights, centralise auth`.
