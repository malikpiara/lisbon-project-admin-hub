# Prototype handover — run & evaluate the Sanity and Payload CMS spikes

> **⚠️ Superseded (2026-06-23).** The evaluation is done: **Payload on Supabase
> Postgres** was chosen, and the Sanity spike has been removed from the repo.
> This file is kept as a historical record of the bake-off. For the current
> setup see the **Decision** section of [CMS-EVALUATION.md](./CMS-EVALUATION.md)
> and [`.env.example`](../.env.example). To run the app now: put `PAYLOAD_SECRET`
> + a Supabase `DATABASE_URI` in `.env.local`, then `pnpm install` →
> `pnpm seed:payload` → `pnpm dev`, and open `/cms-admin`.

**Purpose:** let Malik run the two CMS prototypes locally and *feel* the editing
experience before deciding. This file is both a human runbook and a handover for
a fresh Claude Code session.

> **If you are the Claude reading this:** your job is to help the user **run and
> view** the two prototypes (Payload and Sanity) and the existing bespoke admin,
> and answer questions about how they work. **Do not re-architect, refactor, or
> "improve" anything, and do not commit secrets.** The evaluation and rationale
> live in [`docs/CMS-EVALUATION.md`](./CMS-EVALUATION.md); the architecture in
> [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md). Read both before changing code.

## What's in this branch

Branch: **`claude/sharp-archimedes-dz2je7`**. Three things sit side by side,
each isolated in its own route group; the public site is unchanged:

- **Payload** (self-hosted CMS) — admin at `/cms-admin`, runs fully locally on
  SQLite. Branded to the LP design system.
- **Sanity** (hosted CMS) — embedded Studio at `/studio`; a live cloud project
  (`8itayyvi`) is already seeded. Branded to the LP design system.
- **Bespoke admin** (the current mock) — at `/admin`, localStorage-backed, for
  comparison.

Both CMSs are seeded with the same content: **14 services, 140 topics, 4
quick-access cards.**

## Prerequisites

- **Node 22+** and **pnpm** (`corepack enable` or install pnpm).
- The repo cloned and this branch checked out.
- A browser. Two terminals are handy (one for Next, one for the Sanity Studio).
- A Sanity account that can access project `8itayyvi` (the one used in the
  pilot was `lisbon.project@lisboaux.com`).

## 1. Setup (once)

```bash
git fetch origin
git switch claude/sharp-archimedes-dz2je7
git pull
pnpm install
```

Create **`.env.local`** in the repo root (it's gitignored — never commit it):

```bash
# --- Payload (local SQLite) ---
PAYLOAD_SECRET=GENERATE_ONE        # e.g. run: openssl rand -hex 32
DATABASE_URI=file:./payload.db
PAYLOAD_SEED_EMAIL=admin@example.com
PAYLOAD_SEED_PASSWORD=changeme123

# --- Sanity (cloud project already created + seeded; dataset is public-read) ---
NEXT_PUBLIC_SANITY_PROJECT_ID=8itayyvi
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-06-01
SANITY_STUDIO_PROJECT_ID=8itayyvi
SANITY_STUDIO_DATASET=production
# Only needed to RE-seed Sanity (NOT needed just to view it). Create an
# "Editor" token at sanity.io/manage -> API -> Tokens, then paste it here:
SANITY_API_WRITE_TOKEN=
```

## 2. Run Payload (its admin)

```bash
pnpm seed:payload     # creates payload.db (SQLite) + admin user + content
pnpm dev              # starts Next on http://localhost:3000
```

Open and explore:
- **Admin:** http://localhost:3000/cms-admin → log in `admin@example.com` /
  `changeme123`.
- **Read demo (server-rendered via Payload's Local API):**
  http://localhost:3000/payload-demo

What to notice: branded login (green "LP", Quicksand); a **Content** group
(Services · Topics · Quick access cards) and an **Admin** group (Users); open a
**Service** and scroll — title, slug, short description, the repeatable **Intro**
paragraphs, and a **Topic**'s nested **Article** (sections, bullets, FAQs). Try
the **API** tab on a document, edit + save, and create a new service.

## 3. Run Sanity (its Studio)

In a **second terminal** (leave `pnpm dev` running):

```bash
npx sanity dev        # starts the Studio on http://localhost:3333
```

Open and explore:
- **Studio:** http://localhost:3333 → log in with the Sanity account for project
  `8itayyvi`. Your 14 services are there.
- **Read demo (server-rendered via GROQ):** http://localhost:3000/sanity-demo

What to notice: the desk structure (Quick Access · Services & Information ·
Topics), editing a document, **document history** (who changed what + revert),
and the **Vision** tool (GROQ playground). Try editing a field and watch
`/sanity-demo` update on refresh.

> ⚠️ **Use `npx sanity dev` (port 3333) to evaluate the Sanity editor**, not the
> embedded `http://localhost:3000/studio`. The embedded route renders on the
> server but threw a **client-side error in Next dev mode** (likely the React
> `19.2.4`-vs-`19.2.5` peer or a Turbopack-dev quirk). `npx sanity dev` is the
> clean way to feel the editing experience. (`/sanity-demo` reads fine either way.)
>
> If the Studio shows a CORS error, add `http://localhost:3333` at
> sanity.io/manage → API → CORS Origins (with "Allow credentials").

## 4. Public site + the bespoke admin (for comparison)

All on `pnpm dev` (http://localhost:3000):
- **Public site:** `/` — still reads `localStorage` (the CMSs are *alongside*,
  not wired into it yet).
- **Bespoke admin (current mock):** `/admin` — localStorage-backed, single
  browser, no login. This is the "build our own" baseline.

## How to evaluate (what to pay attention to)

You're judging **editor feel for non-technical staff**. In each of Payload and
Sanity, do the same tasks and compare:
1. Create a new service; give it a title, short description, a couple of topics.
2. Open a topic and edit its article (sections, bullets, an FAQ).
3. Reorder items; delete one; undo/revert if you can.
4. Notice: clarity of labels, how obvious the next step is, speed, how scary
   "publish/delete" feels, and whether *you'd trust a volunteer with it*.

Cross-cutting reminders:
- **Payload** = one app, your database, secure-by-default, fully open-source/owned.
- **Sanity** = hosted, polished, real-time, but a vendor dependency (and roles
  cost money beyond the free Admin/Viewer).
- See the full comparison + decision matrix in `docs/CMS-EVALUATION.md`.

## Known gotchas / notes for the agent

- The repo is **ESM** (`"type": "module"` in package.json) — required by Payload 3.
- Seeds run via **tsx** (`pnpm seed:payload`, `pnpm seed:sanity`); `payload run`
  was unreliable in the build environment.
- **`payload.db` and `.env.local` are gitignored** — they don't come with the
  repo; create `.env.local` and run `pnpm seed:payload` locally.
- The Sanity **dataset is public-read** and already seeded; a write token is only
  needed to **re-seed** (`pnpm seed:sanity`).
- Ports: **Next = 3000**, **Sanity Studio (`npx sanity dev`) = 3333**.
- `pnpm build` is green; `pnpm lint` available.

## File map

- **Sanity:** `sanity.config.ts`, `sanity.cli.ts`, `sanity/` (env, schemaTypes,
  lib, structure, components), `app/(studio)/`, `app/(frontend)/sanity-demo/`,
  `scripts/seed-sanity.ts`
- **Payload:** `payload.config.ts`, `payload/collections/`, `app/(payload)/`,
  `payload-types.ts`, `app/(frontend)/payload-demo/`, `scripts/seed-payload.ts`
- **Bespoke admin:** `app/(frontend)/admin/`, `components/admin/`,
  `lib/admin-store.js`, `lib/admin-default-data.js`
- **Public site:** `app/(frontend)/(site)/`
- **Docs:** `docs/CMS-EVALUATION.md`, `docs/ARCHITECTURE.md`

## Troubleshooting

- **Payload admin 500 / DB error:** ensure `PAYLOAD_SECRET` + `DATABASE_URI` are
  set and you ran `pnpm seed:payload`. Delete `payload.db` and re-seed to reset.
- **Sanity Studio blank / login loop:** confirm you're logged into the account
  that owns project `8itayyvi`; check CORS origins (above).
- **`/studio` shows a red error overlay:** known dev issue — use `npx sanity dev`.
- **Port already in use:** stop whatever is on 3000/3333 and retry.
- **pnpm install fails:** confirm Node 22+ and a clean `pnpm install`.

## Do NOT

- Don't commit `.env.local`, `payload.db`, or any token.
- Don't refactor, re-theme, or "wire the CMS into the public site" — this is an
  evaluation, not a migration. Ask before changing anything beyond running it.
