# Release checklist — from spike to "the team uses this"

**Last updated:** 2026-07-07 · owner: Malik

**Definition of done:** the Lisbon Project team signs in at
`lp.lisboaux.com`, edits real content, publishes it (directly or via
review), visitors see that content, and the team gets insights — with
Malik out of the daily loop (see the builder-relationship principle:
last-mile choices are handoffs, not tickets to Malik).

Ordered by dependency, not importance — the top items unblock everything
below them. Detail lives in the linked docs; this page is only the list.

---

## 1. Wire the public site to Payload — THE release blocker ✅ DONE (2026-07-07)

The public pages now render **server-side from published Payload content**
through the `lib/content.js` adapter; the localStorage mock store was removed.
What the team edits in `/admin` now reaches visitors.

- [x] Public pages read **published** Payload content server-side — home,
      services index, category pages, articles, quick access, contacts.
- [x] Closes the **high-impact SEO issue** — pages are server-rendered, so
      crawlers get real HTML instead of empty client shells
      ([SEO-AUDIT.md](./SEO-AUDIT.md)).
- [x] Retired the localStorage read-path — `AdminProvider`/`useAdmin` removed,
      `lib/admin-store.js` deleted.
- [x] Admin actions call `revalidatePublicContent()`
      (`lib/revalidate-public.js`) so edits refresh the affected public routes.
- [ ] Still verify end-to-end in prod once deployed (SSG + on-demand
      revalidate): edit in `/admin` → confirm the live page updates.

## 2. Database: migrations before any real deploy

Every schema change so far was **dev-pushed** with no migration files —
the full list is in
[ADMIN-HANDOVER.md](./ADMIN-HANDOVER.md#️-schema-changes-were-dev-pushed--production-needs-migrations)
(audit fields, audit-log + its enum, versions on Services, drafts on
Topics, `joinedAt` on Users, …).

- [ ] `payload migrate:create` → commit the migration(s).
- [ ] Prod boot must **run migrations, not push** (push is dev-only).
- [ ] Verify against a fresh database that migrate produces a working schema.

## 3. Deploy target

- [ ] Vercel project + domain **lp.lisboaux.com** (DNS at LisboaUX).
- [ ] Env: `PAYLOAD_SECRET`, `DATABASE_URI` → Supabase **transaction pooler
      (port 6543)** — the session pooler caps at 15 connections and has
      already taken dev down; `DATABASE_POOL_MAX` small;
      `NEXT_PUBLIC_SITE_URL=https://lp.lisboaux.com`.
- [ ] `next build` passes (strict TS — typecheck locally first; recharts
      typings in `components/ui/chart.tsx` have bitten before).
- [ ] Decide `/cms-admin` in prod: keep as maintenance escape hatch or
      block the route. (The custom `/admin` no longer links to it.)

## 4. Accounts, roles, and data hygiene

- [ ] **Delete the test users** (`test@`, `test2@`, `test3@roundtwenty.com`)
      — test2's password was used in automated testing and isn't secret.
- [ ] **Rotate the seed admin password** (`changeme123` is in docs and env).
- [ ] Create real team accounts via the Team page's **invite links**;
      decide who's **admin** (publishes, approves, manages team) vs
      **editor** (submits for review).
- [ ] Decide the review policy for the migration sprint: migrators as
      admins, or daily batch-approval in `/admin/review`
      ([CONTENT-MIGRATION-AUDIT.md §5](./CONTENT-MIGRATION-AUDIT.md)).
- [ ] Delete leftover test content: the 4 "New card" Quick Access rows
      (ids 10, 12, 13, 14 — see ARCHITECTURE's pre-release list).

## 5. Content migration (the team's part)

Tracked in full in [CONTENT-MIGRATION-AUDIT.md](./CONTENT-MIGRATION-AUDIT.md):

- [ ] Design team answers the **6 questions** (legal-review flag, category
      set, feedback forms, workshop recordings, PDFs, screenshot guides).
- [ ] Build the content gaps in the audit's suggested order — **rich text
      links/headings and file uploads first** (content copied before those
      exist gets redone).
- [ ] Execute the page-by-page checklist (13 category pages, 62 articles).
- [ ] Rescue the ~10 MailerLite-hosted PDFs **before the old account
      closes**.

## 6. Analytics & comms

- [ ] Create the **"Lisbon Project" PostHog project** (manual — the MCP key
      is scoped to Adamastor) and set `NEXT_PUBLIC_POSTHOG_*` in prod env
      ([ANALYTICS.md](./ANALYTICS.md)).
- [ ] Newsletter signup: MailerLite API creds, or ship with the working
      Supabase `subscribers` fallback (already in place; parked decision).
- [ ] Set a short PostHog retention window for
      `chatbot_conversation_logged` (special-category data —
      [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) item 4).

## 7. Security follow-ups (decide, don't drift)

From [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) — deliberately not applied
yet because none are low-risk:

- [ ] Dependency vulns: narrow `pnpm.overrides` for `undici` ≥ 7.28.0, then
      re-test login + admin CRUD against the real DB.
- [ ] CSP (report-only first; must allowlist PostHog, Maps, chatbot iframe,
      Google Fonts).
- [ ] Fill the **privacy contact email** placeholder (`privacy/page.js`).
- [ ] HSTS: confirm Vercel sets it in prod.

## 8. Known post-release work (don't block on these)

- Email adapter (e.g. Resend): invite/reset links get emailed automatically
  and self-serve "forgot password" unlocks — the token flow doesn't change
  ([ADMIN-HANDOVER.md](./ADMIN-HANDOVER.md)).
- Slug view/edit in `/admin`; version-history *panel* for Articles (they
  already record versions); my-account page.
- Lawyer-review status flag + urgent-notice banner (Gaps 4–5 of the
  migration audit) — small, and wanted early in content entry.
- Reader feedback forms (pending the design team's Question 3).
- DS cross-mode token inconsistencies — Rafael's call
  ([ARCHITECTURE.md](./ARCHITECTURE.md) pre-release list).
- Other languages (Portuguese, Nepalese) — postponed by decision; keep the
  Portuguese titles from the old site (migration audit, Gap 6 note).

---

**Suggested sequence:** 2 → 3 (deployable shell with placeholder content)
→ 1 (public reads Payload; the release becomes *real*) → 4 (accounts +
hygiene) → 5 (content sprint) → 6–7 alongside the sprint → launch → 8.
