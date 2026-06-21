# CMS evaluation — Sanity vs Payload

Both CMSs are installed **side by side on this branch** so they can be compared
in the real codebase, against the real content model, before we commit to one.
Nothing here replaces the existing app: the public site and the `/admin` mock
CMS still run exactly as before (from `localStorage`). The two CMSs are added
alongside, each isolated in its own route group.

> This is a spike, not a finished migration. The goal is a fair, hands-on
> comparison. The final decision is yours — see [Recommendation](#recommendation).

## TL;DR

|                         | **Sanity**                                  | **Payload**                                              |
| ----------------------- | ------------------------------------------- | ------------------------------------------------------- |
| Version installed       | `sanity` 6.1.0, `next-sanity` 13.1.1        | `payload` 3.85.1 (+ `@payloadcms/next`, `db-sqlite`)    |
| Where the data lives    | Sanity-hosted **Content Lake** (SaaS)       | **Your** database (SQLite here; Postgres/Mongo too)     |
| Admin UI                | `/studio` (embedded)                        | `/cms-admin`                                            |
| Read demo               | `/sanity-demo`                              | `/payload-demo`                                         |
| API to read content     | GROQ (+ GraphQL)                            | Local API (no HTTP), REST, GraphQL                      |
| Runs in this repo today | Needs a **free project id** (1 manual step) | ✅ **Runs fully locally** (SQLite), already seeded      |
| `pnpm build`            | ✅ green                                     | ✅ green                                                 |
| Self-hostable           | Studio yes; content store no (SaaS)         | ✅ entirely self-hosted                                  |
| Cost at small scale     | Generous free tier, then per-seat/usage     | Free (OSS); you pay only for hosting + DB               |

Both are production-grade, both define schemas in TypeScript in this repo, and
both integrate cleanly with Next 16 / React 19. The decision is mostly about
**where content lives** (hosted SaaS vs your own DB) and **editor/Workflow
needs**, not raw capability.

## What you can click right now

```bash
pnpm install
pnpm dev
```

- **Payload** works immediately once seeded:
  ```bash
  # .env.local already needs PAYLOAD_SECRET + DATABASE_URI (see .env.example)
  pnpm seed:payload
  ```
  Then open <http://localhost:3000/cms-admin> (first run: create a user, or use
  the seeded `admin@example.com` / `changeme123`) and
  <http://localhost:3000/payload-demo>.

- **Sanity** needs a free project first (one command, see
  [Sanity setup](#sanity-setup)), then `/studio` and `/sanity-demo` come alive.

## Architecture: how they were added

Embedding Payload forced one structural change, which everything else builds on.

Payload's admin renders its **own `<html>`/`<body>`** (via its `RootLayout`), so
it needs to be a **separate root layout**. Next 16 only allows multiple root
layouts when there is **no** top-level `app/layout.js`. So the existing app was
moved into its own route group with its own root layout:

```
app/
├─ (frontend)/        ← the existing app (its own root layout: html/body/fonts/AdminProvider)
│  ├─ layout.js
│  ├─ (site)/         ← public site (unchanged URLs: /, /services/..., /calendar)
│  ├─ admin/          ← existing localStorage mock CMS (/admin) — untouched
│  ├─ components/     ← design-system gallery (/components)
│  ├─ sanity-demo/    ← reads from Sanity  (/sanity-demo)
│  └─ payload-demo/   ← reads from Payload (/payload-demo)
├─ (studio)/          ← Sanity Studio root layout (isolated from app styles)
│  └─ studio/[[...tool]]/   → /studio
├─ (payload)/         ← Payload root layout
│  ├─ cms-admin/[[...segments]]/  → /cms-admin
│  └─ api/[...slug] | api/graphql | api/graphql-playground  → /api/*
├─ globals.css        ← stays at app root (applies to all groups)
└─ icon.svg           ← favicon for all groups
```

All public URLs are unchanged — the move is URL-preserving (route groups don't
appear in the path). Verified with `pnpm build` (all 193 original routes intact).

Other repo-wide changes (small, shared by both / required by Payload):

- `package.json` → `"type": "module"`. The whole repo was already written in ESM
  syntax; Payload 3 **requires** the project to be ESM (otherwise its loader
  hits `ERR_REQUIRE_ASYNC_MODULE`). No source changes were needed.
- `next.config.mjs` → wrapped with `withPayload(...)`.
- `tsconfig.json` → added the `@payload-config` path; **excluded `scripts/`**
  from the app typecheck (seed scripts run via `tsx`, not as part of the build).
- `.env.example` and `.gitignore` updated for both CMSs.

## Content model mapping

The current store (`lib/admin-default-data.js`, `lib/article-defaults.js`) maps
cleanly to both. Both spikes model it **relationally** (services and topics as
separate documents/collections, contacts embedded) for an apples-to-apples view.

| Current shape (`useAdmin()` store) | Sanity (`sanity/schemaTypes`)        | Payload (`payload/collections`)         |
| ---------------------------------- | ------------------------------------ | --------------------------------------- |
| `service` (object in `services[]`) | `service` **document**               | `services` **collection**               |
| `service.topics[]`                 | `topic` **document** → ref `service` | `topics` **collection** → rel `service` |
| `topic.article` (object)           | `article` **object** on `topic`      | `article` **group** on `topics`         |
| `article.sections[]`               | `articleSection` object array        | array field (named subfields)           |
| `article.faqs[]`                   | `faq` object array                   | array field                             |
| `service.contacts[]`               | `contact` object array (embedded)    | array field (embedded)                  |
| `service.intro[]` (strings)        | `array` of `text` (primitive)        | array of `{ text }` (named subfield)    |
| `service.categoryFilters[]`        | `array` of `string`                  | array of `{ value }`                    |
| `quickAccess[]`                    | `quickAccess` document               | `quick-access` collection               |
| `tone` / `iconKey`                 | `string` + options list              | `select` + options                      |

Both reuse the canonical `toneOptions` / `iconOptions` from
`lib/admin-default-data.js`, so the option lists stay in one place.

> **One real modelling difference surfaced here:** Sanity supports arrays of
> **primitive** strings (`intro`, `categoryFilters`) directly; Payload arrays
> always wrap a **named subfield** (`{ text }`, `{ value }`). Minor, but it
> shows up in the data shape and in queries.

### Rich text (deliberately deferred in the spike)

The article `body` is kept as a plain textarea in **both** spikes, to match the
existing data exactly and keep the comparison fair. This sidesteps each CMS's
headline editor — which is itself a key decision axis:

- **Sanity** → Portable Text (structured JSON, render with `@portabletext/react`).
- **Payload** → Lexical (already the configured `editor` here; add a `richText`
  field to switch any field over).

Picking the winner is a good moment to also pick the rich-text model.

## Sanity setup

1. Create a free project + dataset (interactive, writes nothing to the repo):
   ```bash
   npx sanity login
   npx sanity init --env .env.local   # creates the project, fills NEXT_PUBLIC_SANITY_*
   ```
   (Or create it in <https://sanity.io/manage> and copy the project id.)
2. Add a write token (<https://sanity.io/manage> → API → Tokens → **Editor**)
   to `.env.local` as `SANITY_API_WRITE_TOKEN`.
3. Seed and run:
   ```bash
   pnpm seed:sanity     # imports the existing content into the dataset
   pnpm dev
   ```
4. Open `/studio` (the embedded editor) and `/sanity-demo` (server-rendered from
   GROQ). Add `http://localhost:3000` as a CORS origin in `sanity.io/manage`
   (with credentials) if the Studio asks.

Files: `sanity.config.ts`, `sanity.cli.ts`, `sanity/env.ts`,
`sanity/schemaTypes/*`, `sanity/lib/{client,queries,image}.ts`.

## Payload setup

Already wired for local SQLite — no external services.

1. `.env.local` needs (see `.env.example`):
   ```
   PAYLOAD_SECRET=<random; openssl rand -hex 32>
   DATABASE_URI=file:./payload.db
   ```
2. Seed and run:
   ```bash
   pnpm seed:payload    # creates tables, imports content, makes an admin user
   pnpm dev
   ```
3. Open `/cms-admin` (log in with the seeded `admin@example.com` /
   `changeme123`, or create the first user) and `/payload-demo`.

Swap the database with a one-line adapter change (the rest of the config is
identical):

```ts
// Postgres instead of SQLite
import { postgresAdapter } from "@payloadcms/db-postgres";
db: postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI } }),
```

A managed Postgres (e.g. **Supabase** — already connected to this workspace) or
Mongo makes Payload production-ready while staying fully self-hosted.

Files: `payload.config.ts`, `payload/collections/*`, `app/(payload)/*`,
`payload-types.ts` (generated via `pnpm payload generate:types`).

## Side-by-side comparison

| Dimension              | Sanity                                                                 | Payload                                                                  |
| ---------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **Model**              | Hosted SaaS (Content Lake) + open-source Studio you host              | Open-source, self-hosted; lives **inside** this Next app                 |
| **Data ownership**     | Content in Sanity's cloud; export via API/CLI                         | Content in **your** DB; full ownership, trivial backups                 |
| **Hosting**            | Studio = static route on Vercel; content = Sanity                    | One Next app (admin + API + site) + a database                          |
| **Cost**               | Free tier (generous), then per-seat + usage/bandwidth                 | Software free; pay only for app hosting + DB                            |
| **Editor experience**  | Polished, real-time multiplayer, excellent media/hotspot             | Very good, fast; single-author by default                               |
| **Rich text**          | Portable Text (portable JSON, great for custom rendering)            | Lexical (block-based, extensible, HTML/React converters)               |
| **Schema location**    | TS in `sanity/schemaTypes` (in repo)                                  | TS in `payload/collections` (in repo)                                   |
| **Querying**           | GROQ (very expressive), GraphQL                                       | Local API (no network hop in RSC), REST, GraphQL                       |
| **Type safety**        | `sanity typegen` from GROQ queries                                    | `payload generate:types` → `payload-types.ts` (used here)              |
| **Relationships**      | References + GROQ joins (`->`, `references()`)                        | First-class `relationship` fields, `depth` population                   |
| **Auth / roles**       | Sanity-managed users + roles                                          | Built-in auth collection, access-control fns, field-level rules         |
| **Drafts / preview**   | Drafts + Presentation/live preview built in                          | Drafts, versions, autosave, live preview                                |
| **Localization**       | Plugin / dataset patterns; field-level i18n                          | First-class `localization` config (locales per field)                  |
| **Media**              | Best-in-class image pipeline (CDN, transforms, hotspot)             | Upload collections + `sharp` (self-hosted; can offload to S3/R2)        |
| **Migrations**         | Dataset import/export; schema is code                                | DB migrations (`payload migrate`) + dev push                            |
| **Offline / local**    | Needs the hosted project (even in dev)                               | 100% local (SQLite file) — great for dev/CI                            |
| **Footprint added**    | ~736 pkgs; heavy Studio client bundle (separate route)              | Admin UI compiled into the app; needs a DB driver                       |
| **Lock-in**            | Higher (hosted store, GROQ)                                          | Lower (your DB, standard SQL via Drizzle)                              |

### Frictions actually hit during this spike (useful signal)

- **Sanity**: a transitive peer wants `react@^19.2.5` but the repo pins
  `19.2.4` (warning only; Studio still builds/runs). `@sanity/cli` also pulls a
  `vite`/`esbuild` peer mismatch — only relevant to the `sanity` CLI, not the
  app build. The Studio can't run in this sandbox without a project id (by
  design — it's a hosted service).
- **Payload**: required `"type": "module"` (ESM) on the repo. `payload run
  <script>` was a no-op in this environment, so seeding uses `tsx` directly
  (`pnpm seed:payload`) with a tiny `.env.local` loader. The admin catch-all
  folder must be `[[...segments]]` (plural) to match Payload's types. Native
  build scripts (`sharp`, `esbuild`) were skipped by pnpm but everything works
  (`sharp` is optional and unused — no images in the model; `libsql` ships
  prebuilt binaries).

## How either one would replace the current store

Today the public pages are client components reading `useAdmin()` (localStorage).
To go live on a CMS:

1. Move the read in `components/services/*` and the public pages from
   `useAdmin()` to a server fetch:
   - Sanity: `client.fetch(serviceBySlugQuery, { slug })` in the RSC.
   - Payload: `getPayload({ config }).find({ collection: "services", ... })`.
2. Restore real SSG: `generateStaticParams` can read slugs from the CMS instead
   of `lib/services-data.js`, closing the "client-rendered from localStorage"
   gap noted in [ARCHITECTURE.md](./ARCHITECTURE.md).
3. Retire the `/admin` mock in favour of `/studio` or `/cms-admin`.
4. Add on-publish revalidation (Sanity webhook → `revalidateTag`; Payload
   `afterChange` hook → `revalidatePath`).

The `/sanity-demo` and `/payload-demo` routes already demonstrate steps 1–2 end
to end for the services list.

## Recommendation

Both are safe choices; pick on **operating model**, not features.

- **Lean Payload if** you want to **own the data** and keep everything in one
  self-hosted Next app + a database (Supabase Postgres is right here), value a
  zero-cost-software OSS stack, want the Local API (no network hop in RSCs), and
  are happy running a DB. It also most naturally replaces the current in-repo
  `/admin`. This is the lower-lock-in, "it's just our app and our DB" option.

- **Lean Sanity if** editor experience for non-technical staff is paramount
  (real-time collaboration, superb media handling, structured Portable Text),
  you'd rather **not** run/scale a database, and the hosted pricing fits. Great
  when editors are the primary users and ops simplicity matters more than data
  residency.

For this project specifically — a small NGO info site, currently a
zero-backend prototype, likely needing **multilingual** content and simple,
cheap hosting — **Payload on Supabase Postgres** is the most natural fit
(self-hosted, no per-seat cost, first-class localization, replaces the mock
admin directly). Choose **Sanity** if the editorial team is non-technical and
you want the smoothest editing experience without operating a database.

Decision checklist:

- [ ] Who edits content, and how technical are they?
- [ ] Is multilingual content required at launch?
- [ ] Are we OK running a database (and paying for hosting/seats)?
- [ ] Do we need real-time multi-editor collaboration?
- [ ] How important is data residency / avoiding vendor lock-in?

## Removing the one we don't pick

- **Drop Sanity**: delete `sanity.config.ts`, `sanity.cli.ts`, `sanity/`,
  `app/(studio)/`, `app/(frontend)/sanity-demo/`, `scripts/seed-sanity.ts`, the
  `seed:sanity` script, the `NEXT_PUBLIC_SANITY_*` env, and
  `pnpm remove sanity next-sanity @sanity/vision @sanity/image-url styled-components`.
- **Drop Payload**: delete `payload.config.ts`, `payload/`, `app/(payload)/`,
  `app/(frontend)/payload-demo/`, `scripts/seed-payload.ts`, `payload-types.ts`,
  the `payload`/`seed:payload` scripts, remove `withPayload` from
  `next.config.mjs`, the `@payload-config` tsconfig path, and
  `pnpm remove payload @payloadcms/next @payloadcms/db-sqlite @payloadcms/richtext-lexical`.
- If **both** are dropped, also move `app/(frontend)/*` back to `app/*` and
  restore the single `app/layout.js` root layout (the `"type": "module"` switch
  is harmless to keep).
