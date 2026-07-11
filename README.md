# Lisbon Project — Admin Hub

## About

This codebase is part of the **LisboaUX UX Pilot Project for NGOs**, run in
partnership with [Lisbon Project](https://www.lisbonproject.org/) — a nonprofit
working to make migrants and refugees feel at home in Portugal. The pilot is
designed as a replicable model for applying structured UX processes inside
third-sector organisations: stronger user and internal team journeys, more
consistent touchpoints, and sustainable, documented UX foundations.

It's also a programme that gives early-career designers and developers
hands-on experience on real projects with social impact, guided by mentors
from the tech industry.

This repository is the **Admin Hub** for the Lisbon Project site rebuild:
Next.js 16 + React 19 + Tailwind v4 + shadcn (base-nova), on a **Payload CMS
(Supabase Postgres)** backend. It's deployed on Vercel — the public site renders
server-side from Payload, and the team edits content through a custom admin at
`/admin`.

## Getting Started

```bash
pnpm install
cp .env.example .env.local   # fill in values, see below
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Google Calendar integration

The `/calendar` page reads upcoming events from a public Google Calendar via
the Google Calendar API v3. This validates that we can pull live event data
from a public Google Calendar without OAuth, a backend, or a database —
read-only is sufficient as long as the calendar's "Make available to public"
setting is on.

### Setup

1. **Google Cloud Console** → create a project → APIs & Services →
   Library → enable **Google Calendar API**.
2. APIs & Services → Credentials → **Create Credentials → API key**.
3. Restrict the key: **API restrictions** → Google Calendar API only.
   Application restrictions can stay as **None** for local dev; in production
   restrict to the host's egress IPs (Vercel publishes theirs).
4. In Google Calendar, open the calendar's **Settings and sharing** →
   **Access permissions for events** → check "Make available to public".
   Copy the **Calendar ID** from **Integrate calendar**.
5. Paste both values into `.env.local`.

### Current operational state

- The API key in use was generated under Malik's personal Google Cloud
  account (LisboaUX / RoundTwenty). It doesn't require maintenance and can
  be regenerated and swapped without code changes.
- The calendar ID currently wired up belongs to LisboaUX as a stand-in. It
  needs to be replaced with the Lisbon Project's own calendar before
  launch — only the env var changes, no code.

### Caching

`lib/google-calendar.js` uses `fetch(..., { next: { revalidate: 300 } })`, so
the same fetched payload is served for 5 minutes per server instance. At
expected traffic this is well under any Google Calendar API quota.

## Admin Hub (`/admin`)

`/admin` is the **Payload-backed team workspace** — a custom UI (built from the
LP design system) over Payload's headless engine: a dashboard, editors for Quick
Access / services / articles, plus Insights, chatbot Conversations, an activity
History, Team management (invite-link onboarding — no shared passwords), and a
Review queue where admins approve editors' submissions with word-level
before/after diffs. It reads through Payload's Local API and writes via
auth-gated server actions, and is meant to replace Payload's default admin
(`/cms-admin`) for non-technical volunteers. Full detail in
**[docs/ADMIN-HANDOVER.md](docs/ADMIN-HANDOVER.md)**; the path to launch is
**[docs/RELEASE-CHECKLIST.md](docs/RELEASE-CHECKLIST.md)**.

> **The public site renders server-side from Payload** (since 2026-07-07). The
> home/service/article pages are async server components that fetch **published**
> content via `lib/content.js` (SSG + on-demand revalidate); the old localStorage
> store (`AdminProvider` / `useAdmin` / `lib/admin-store.js`) was removed. So
> `/admin` edits reach visitors, and crawlers get real HTML instead of empty
> client shells. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the data
> flow, the seed source, the article model, and the design-system gotchas.

## CMS — Payload on Supabase Postgres

The CMS is **Payload** (admin at `/cms-admin`), running on **Supabase Postgres**.
Set `PAYLOAD_SECRET` and a Supabase `DATABASE_URI` in `.env.local` (see
[`.env.example`](.env.example)), then `pnpm seed:payload` and open `/cms-admin`
(admin) and `/payload-demo` (server-rendered read).

> Decided 2026-06-23 after a hands-on bake-off (Payload vs Sanity vs a custom
> Supabase admin); the Sanity spike has since been removed. The full comparison,
> the decision, and the content-model mapping are in
> **[docs/archive/CMS-EVALUATION.md](docs/archive/CMS-EVALUATION.md)**. The public site
> now reads Payload server-side (done 2026-07-07); the localStorage store was removed.

## Newsletter — MailerLite

The public site footer has a newsletter signup form. The Lisbon Project migrated
its **site** off MailerLite (onto this app) but keeps **MailerLite as the sending
platform**, so it stays the single source of truth for subscribers — sends,
unsubscribes, segments, and MailerLite's own double opt-in all live there.

The signup writes through `lib/mailerlite.js` (upsert into MailerLite), wired in
`components/site/newsletter-actions.js`.

### Setup

1. **MailerLite** → **Integrations** → **API** → generate a token.
2. (Optional) **Subscribers** → **Groups** → open the group signups should land
   in; copy the id from the URL.
3. Paste into `.env.local` (see [`.env.example`](.env.example)):
   - `MAILERLITE_API_KEY` — the token from step 1.
   - `MAILERLITE_GROUP_ID` — optional; the group from step 2.

### Parked until credentials exist

While `MAILERLITE_API_KEY` is empty, `lib/mailerlite.js` is a **no-op** and the
action **falls back to capturing signups in the Payload `subscribers` collection**
(Supabase Postgres), so none are lost during the transition. Those rows are the
import source for MailerLite once it's live — after that the local capture can be
retired. Setting the key flips signups to MailerLite automatically, no code
change. MailerLite's built-in double opt-in covers consent, so no custom
opt-in/unsubscribe flow is needed here.

## Documentation

Start with [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (data flow, the
non-standard radius scale, the `cn()`/tailwind-merge setup, how `tone` works, and
the known-issues + pre-release checklist) — read it before changing data flow or
the design system. For environment variables and deployment, see
**[docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)**. A full index of everything in
`docs/` is in **[docs/README.md](docs/README.md)**.

## Deploy on Vercel

Deploy via the [Vercel Platform](https://vercel.com/new). The full environment
variable list — which are required, which are optional feature flags, which are
secrets, and where to get each — is in **[docs/ENVIRONMENT.md](docs/ENVIRONMENT.md)**.
At minimum the app needs `PAYLOAD_SECRET` and `DATABASE_URI`; everything else
turns a feature on or off. Do not commit `.env.local`.
