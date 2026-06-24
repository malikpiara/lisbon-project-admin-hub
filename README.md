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

This repository is the Admin Hub prototype for the Lisbon Project site rebuild:
Next.js 16 + React 19 + Tailwind v4 + shadcn (base-nova). Built from Figma
screens; backend deferred.

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

## Mock CMS

`/admin` is a localStorage-backed editor for the Quick Access section, the
14 services, per-service topics/contacts, and each topic's full **article body
and FAQ** (`/admin/services/[slug]/[topic]`). There is no backend; content lives
in `localStorage["lp-admin-data-v1"]`.

> **It is not isolated from the public site.** A single `AdminProvider` wraps the
> whole app, so the public home/service/article pages read the same store. Edits
> in `/admin` preview live on the public pages **in the same browser**; a fresh
> browser or another visitor sees the seed defaults. See
> [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the data flow, the two seed
> sources, the mock article model, and the design-system gotchas.

## CMS — Payload on Supabase Postgres

The CMS is **Payload** (admin at `/cms-admin`), running on **Supabase Postgres**.
Set `PAYLOAD_SECRET` and a Supabase `DATABASE_URI` in `.env.local` (see
[`.env.example`](.env.example)), then `pnpm seed:payload` and open `/cms-admin`
(admin) and `/payload-demo` (server-rendered read).

> Decided 2026-06-23 after a hands-on bake-off (Payload vs Sanity vs a custom
> Supabase admin); the Sanity spike has since been removed. The full comparison,
> the decision, and the content-model mapping are in
> **[docs/CMS-EVALUATION.md](docs/CMS-EVALUATION.md)**. The public site still
> reads `localStorage` — wiring it to Payload is the next milestone.

## Architecture & known issues

[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) documents how content flows, the
non-standard radius scale, the `cn()`/tailwind-merge setup, how `tone` works,
and the running list of known inconsistencies. Read it before changing data flow
or the design system.

## Deploy on Vercel

Deploy via the [Vercel Platform](https://vercel.com/new). Set both
`GOOGLE_CALENDAR_API_KEY` and `GOOGLE_CALENDAR_ID` as Environment Variables
in the project settings. Do not commit `.env.local`.
