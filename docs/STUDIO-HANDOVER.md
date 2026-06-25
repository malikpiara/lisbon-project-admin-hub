# Studio handover — the headless-Payload admin (`/studio`)

**Purpose:** a custom editing UI built on Payload's **headless** engine, meant to
**replace Payload's default admin** (`/cms-admin`) for the Lisbon Project's
non-technical volunteers. Payload stays as the backend (schema, auth, versions,
Postgres); the UI is ours, built from the LP design system — the same components
the `/admin` localStorage prototype uses.

> **If you are the Claude reading this:** the `/studio` routes are a working
> spike on branch **`spike-cms-eval`**. Read [ARCHITECTURE.md](./ARCHITECTURE.md)
> and [`AGENTS.md`](../AGENTS.md) first (non-standard radius scale; `cn()` over
> `twMerge`; one shared store for `/admin` + public). Do **not** commit secrets
> (`.env.local` is gitignored). Commits on this repo use **no** `Co-Authored-By`
> trailer. The strategic decision (Payload on Supabase Postgres) lives in
> [CMS-EVALUATION.md](./CMS-EVALUATION.md); the teardown that motivated this UI is
> in [payload-admin-teardown.md](./payload-admin-teardown.md).

> ⚠️ **Route-name reuse.** An earlier Sanity spike also lived at `/studio` (see
> the superseded [PROTOTYPE-HANDOVER.md](./PROTOTYPE-HANDOVER.md)). That is gone.
> Today `/studio` = the headless-Payload admin described here.

## How to run

1. `.env.local` needs `PAYLOAD_SECRET` + Supabase `DATABASE_URI` (already set on
   Malik's machine; never print these).
2. `pnpm install` → `pnpm dev`, open `/studio`.
3. **Login:** `/studio` is gated on the Payload session. If you're bounced to
   `/cms-admin/login`, sign in there (dev creds: `admin@example.com` /
   `changeme123`) — the session is shared, so `/studio` then opens. The session
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
- **Auth is not inferred** by the Local API. The acting user must be passed
  explicitly (we resolve it from `payload.auth({headers})` and write
  `createdBy`/`updatedBy` + the audit log ourselves).
- The shell (`app/(frontend)/studio/layout.js`) gates the whole group on
  `payload.auth` and frames it with `StudioSidebar`.

## What's built

| Area | Route / file | Notes |
|---|---|---|
| Shell | `layout.js`, `components/admin/studio-sidebar.jsx` | Sticky sidebar (`h-dvh`), grouped nav (Content / Analytics / Admin), signed-in footer |
| Dashboard | `studio/page.js` | Counts + cards into each editor |
| Quick Access | `quick-access/` | Editor + reorder + save-state |
| Services | `services/` + `services/[id]/` | Editor: basics, intro, icon, **editable contact-category filters**, contacts (reorder/duplicate), topic list (reorder), **version history + diff + restore** |
| Topics | `topics/` + `topics/[id]/` | Searchable list (140 topics); editor with **live `ArticlePreview`**, sections + FAQs (reorder/duplicate), required markers |
| Team | `users/` | Create / reset-password / remove volunteers; **self-delete guard**; "You" badge |
| History | `history/` | Activity feed of every create/update/delete, filterable, with who + when |
| Audit | `payload/fields/audit.ts`, `components/admin/audit-meta.jsx`, `lib/format-audit.js` | `createdBy`/`updatedBy` on every collection; labeled meta bar (label-value hierarchy) |
| Audit log | `payload/collections/AuditLog.ts`, `lib/audit-log.js` | Append-only; best-effort `logAudit()` from each write action |
| Guards | `components/admin/unsaved-changes-guard.jsx` | In-app "Leave without saving?" modal (beforeunload + capture-phase anchor intercept) |

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
   `/cms-admin/login`. Until `/studio` has its own login (+ forgot-password), we
   can't drop the default admin. **Recommended next.**
2. **Slug control.** No way to view/edit a doc's slug in `/studio` yet.
3. **Topic → service reassignment.** A topic can't be moved between categories.
4. Optional polish: my-account page, reorder loading/feedback states,
   version-history for Topics/Quick-Access (only Services has versions),
   item-level array diffs.

## Still true from the broader project

- **Public read-path is unchanged:** the public site still reads the
  **localStorage** store (the `/admin` prototype), *not* Payload. Wiring the
  public pages to Payload is a separate, larger task.
- Gotchas that bit during the build: same-eval preview reads are stale (split
  click + read into separate `preview_eval` calls); `[id]`/`(frontend)` paths
  need `GIT_LITERAL_PATHSPECS=1` for `git add`.

## Git state

Branch `spike-cms-eval`. Latest:

- `1c3fcb8` refine(studio): fixed sidebar, audit-metadata hierarchy & plain copy
- `ef26862` feat(studio): team management, contact categories & reordering
- `d9a1994` feat(studio): activity-log history feed
- `4486874` feat(studio): shell — sidebar, dashboard, searchable topics list
- `6943ef8` feat(studio): Payload-backed editors with live preview, guards & audit
- `75aa472` feat(cms): extend the Payload schema for the Studio
