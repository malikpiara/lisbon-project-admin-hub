# Admin handover — the headless-Payload admin (`/admin`)

**Purpose:** a custom editing UI built on Payload's **headless** engine, meant to
**replace Payload's default admin** (`/cms-admin`) for the Lisbon Project's
non-technical volunteers. Payload stays as the backend (schema, auth, versions,
Postgres); the UI is ours, built from the LP design system.

> **History (2026-06-30):** this admin started life at `/studio` while the old
> localStorage **mockup** editor occupied `/admin`. The mockup was removed and the
> Payload-backed routes moved into `/admin`; `/studio` is now unused. (An even
> earlier Sanity spike also briefly lived at `/studio` — see the superseded
> [PROTOTYPE-HANDOVER.md](./PROTOTYPE-HANDOVER.md).)

> **If you are the Claude reading this:** the `/admin` routes are a working spike
> on branch **`spike-cms-eval`**. Read [ARCHITECTURE.md](./ARCHITECTURE.md) and
> [`AGENTS.md`](../AGENTS.md) first (non-standard radius scale; `cn()` over
> `twMerge`; the localStorage store still backs the public site). Do **not** commit
> secrets (`.env.local` is gitignored). Commits use **no** `Co-Authored-By`
> trailer. The strategic decision (Payload on Supabase Postgres) lives in
> [CMS-EVALUATION.md](./CMS-EVALUATION.md); the teardown that motivated this UI is
> in [payload-admin-teardown.md](./payload-admin-teardown.md).

## How to run

1. `.env.local` needs `PAYLOAD_SECRET` + Supabase `DATABASE_URI` (already set on
   Malik's machine; never print these).
2. `pnpm install` → `pnpm dev`, open `/admin`.
3. **Login:** `/admin` is gated on the Payload session. If you're bounced to
   `/cms-admin/login`, sign in there (dev creds: `malik@roundtwenty.com` /
   `changeme123`) — the session is shared, so `/admin` then opens. The session
   **expires over long sessions**; re-login the same way. Payload's React login
   form needs a real submit: set `#field-email`/`#field-password` then
   `form.requestSubmit()` — a synthetic `.click()` on the button does **not**
   submit it.

## How it works (the headless pattern)

- **Reads** happen in **server components** via the Payload **Local API**
  (`getPayload({config})` → `payload.find / findByID / findVersions`). `depth`
  controls relationship hydration (e.g. `depth:1` to resolve `createdBy`/
  `updatedBy` → user docs).
- **Writes** happen in **server actions** (`"use server"`) — `create / update /
  delete / restoreVersion`, then `revalidatePath` / `router.refresh()`.
- **Auth is not inferred** by the Local API. The gate is centralised in
  **`lib/admin-auth.js`** (`authedPayload()` → resolves `{payload, user}`,
  redirects to `/cms-admin/login` if there's no user). It's called by the `/admin`
  layout, every page, and every server action — server actions are public POST
  endpoints, so each must gate independently. Writes stamp `createdBy`/`updatedBy`
  + the audit log explicitly (the Local API won't infer the user).
- The shell (`app/(frontend)/admin/layout.js`) gates the whole group and frames it
  with `AdminSidebar` (`components/admin/admin-sidebar.jsx`) — the single sidebar,
  shared by the content editor and `/admin/insights`.

## What's built

| Area | Route / file | Notes |
|---|---|---|
| Shell | `admin/layout.js`, `components/admin/admin-sidebar.jsx` | Sticky sidebar (`h-dvh`), grouped nav (Content / Analytics / Admin), signed-in footer |
| Dashboard | `admin/page.js` | Counts + cards into each editor + Insights |
| Quick Access | `admin/quick-access/` | Editor + reorder + per-card save-state + **unsaved-changes guard** (aggregated across cards) |
| Services | `admin/services/` + `[id]/` | Editor: basics, intro, icon, **editable contact-category filters**, contacts (reorder/duplicate), topic list (reorder), **version history + diff + restore** |
| Articles | `admin/articles/` + `[id]/` | Searchable list; editor with **live `ArticlePreview`**, key links + sections + FAQs (reorder/duplicate), required markers. (Payload collection slug stays `topics`.) |
| Insights | `admin/insights/` | Team-only analytics (PostHog); inherits the layout's auth gate + sidebar |
| Team | `admin/users/` | **Admin-role only.** Create / edit profile / reset-password (with generator) / remove; two-tier roles (admin / editor); self-delete + self-demote guards; "You" badge |
| History | `admin/history/` | Activity feed of every create/update/delete, with who + when |
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
- `categoryFilters` editor surface (Services)
- `auditFields` (createdBy/updatedBy) on Services, Topics, QuickAccess
- `AuditLog` collection
- `versions: { maxPerDoc: 25 }` on **Services** (versions table `_services_v`)

**Before any non-dev deploy:** run `payload migrate:create` and commit the
migration. (See [project memory `project_ts_build_strict`] — untyped helpers also
broke deploys before; typecheck before pushing.)

## What's left to retire `/cms-admin`

1. **Custom login — the keystone.** Everything still redirects to
   `/cms-admin/login`. Until `/admin` has its own login (+ forgot-password), we
   can't drop the default admin. **Recommended next.**
2. **Slug control.** No way to view/edit a doc's slug in `/admin` yet.
3. **Topic → service reassignment.** A topic can't be moved between categories.
4. Optional polish: my-account page, reorder loading/feedback states,
   version-history for Topics/Quick-Access (only Services has versions),
   item-level array diffs.

## Still true from the broader project

- **Public read-path is unchanged:** the public site still reads the
  **localStorage** store (`AdminProvider`/`useAdmin`, `lib/admin-store.js`), *not*
  Payload. The localStorage *editor* was removed with the mockup, so that content
  is now effectively read-only seed data until the public pages are wired to
  Payload — a separate, larger task. Don't delete the store: the public site
  renders from it.
- Gotchas that bit during the build: same-eval preview reads are stale (split
  click + read into separate `preview_eval` calls); `[id]`/`(frontend)` paths need
  `GIT_LITERAL_PATHSPECS=1` for `git add`.

## Git state

Branch `spike-cms-eval`. The `/studio`→`/admin` merge, the `/insights` fold-in to
`/admin/insights`, the auth-gate consolidation into `lib/admin-auth.js`, and the
quick-access unsaved-changes guard landed in `refactor(admin): merge /studio into
/admin, fold in insights, centralise auth`.
