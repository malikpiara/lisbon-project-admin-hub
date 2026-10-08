# Deployment — Cloudflare Workers (OpenNext)

The Admin Hub (public site + `/admin`) runs on **Cloudflare Workers** through
the OpenNext adapter (`@opennextjs/cloudflare`). It moved from Vercel on
2026-10-04, and the Vercel project was deleted the same day. The setup is
copied from Cherrydock, which made the same move on 2026-09-24
(`cherrydock/docs/deployment.md` has the longer story behind most rules here).

This is the runbook: how a request is served, the rules the platform imposes,
and how to deploy, configure, verify and roll back.

## Why it moved

- **Licence.** Vercel's Hobby plan is non-commercial only, and paid work on the
  site (the maintenance agreement, the multilingual proposal) counts as
  commercial.
- **Cost and shared ops.** The Worker lives in Malik's Cloudflare account, which
  already pays for Workers Paid ($5/month) and runs Cherrydock and LogiCola the
  same way, so fixes and gotchas carry across.
- **Known trade-off.** Cherrydock's public-page LCP p75 got slower after its
  move (Vercel 1,499 ms over 30 days; Workers 1,975 ms in its first week). The
  move went ahead anyway. See [Performance](#performance).

## Shape of a request

```
browser ──▶ Cloudflare (zone lisboaux.com, Malik's account)
             └─ lp.lisboaux.com/*  ── Worker route ──▶ Worker "lisbon-project"
                  ├─ a file in .open-next/assets (_next/static, public/) → served directly, no code runs
                  └─ everything else → OpenNext
                        ├─ cached page (SSG/ISR) → regional cache → R2, D1 tag check
                        ├─ stale page → served, then regenerated once via the Durable Object queue
                        └─ dynamic route / server action / /admin → the Next server → Payload → Supabase
```

The `lp` record is a CNAME to `lisboaux.com`, **Proxied**. The route only acts
on proxied records, so the record must stay Proxied.

## The rules

1. **No server secret in a `.env*` file at build time.** OpenNext compiles
   every value in `.env`, `.env.local`, … into the Worker bundle
   (`.open-next/cloudflare/next-env.mjs`). This app's build *does* need the
   database (pages are prerendered from Payload), so `scripts/cf.sh build`
   exports `.env.local` as process environment and sets the file aside while
   it builds. Environment values are not compiled in. After every build the
   bundle is checked for non-`NEXT_PUBLIC_` values.
2. **Deploy fresh builds only.** The R2 cache a deploy uploads is the data the
   build fetched, so `cf.sh deploy` refuses a build older than 30 minutes, and
   the fetch cache is cleared before every build.
3. **Wrangler reads `.env.local` for its own login.** It would take the app's
   `CLOUDFLARE_API_TOKEN` (the Workers AI token) and fail. `cf.sh` never exports
   `CLOUDFLARE_*` and sets `.env.local` aside for deploys. Running wrangler by
   hand: run it from a directory without `.env.local`, or pass
   `--env-file /dev/null`.
4. **Every `NEXT_PUBLIC_*` in `.env.example` must be set for the build.** Next
   inlines them at build time and a missing one becomes `undefined` without an
   error, so `cf.sh build` stops instead. `NEXT_PUBLIC_SITE_URL` is **not** in
   `.env.local` (dev uses localhost): pass `NEXT_PUBLIC_SITE_URL=https://lp.lisboaux.com`
   for a manual build.
5. **The pg pool hands no socket between requests.** A Worker can't use a
   socket another request opened; Payload's shared pool hung every other
   request. `DATABASE_POOL_MAX_USES=1` and `DATABASE_POOL_MAX=50` (wrangler
   vars) close each connection after one query and keep requests out of the
   pool's queue.
6. **Two build workarounds.** `drizzle-kit/api` (Payload's schema push) can't
   load on Workers, so the Cloudflare build aliases it to
   `lib/cloudflare/drizzle-kit-stub.cjs` (`next.config.mjs`). And
   `scripts/cf-trace-extra.mjs` adds `pg-cloudflare` to the server trace
   after the build (`outputFileTracingIncludes` made Turbopack panic).
7. **`/cms-admin` stays closed in production.** It checked `VERCEL_ENV`; on
   Workers the wrangler var `DEPLOY_ENV=production` does the same.
8. **Headers are ours to send.** Vercel added HSTS and long-lived caching for
   `_next/static` by itself; Workers adds nothing. HSTS comes from
   `next.config.mjs` (Cloudflare build only) and `public/_headers` (static
   files, which also sets `_next/static` to a year, immutable).
9. **`*.workers.dev` is `noindex`.** It is a full copy of the site.

## Files that make up the deploy

| File | Role |
| --- | --- |
| `wrangler.jsonc` | The Worker: assets, bindings (R2, D1, Durable Object, Images, self-reference), vars, placement, the route |
| `open-next.config.ts` | The caches: R2 incremental cache behind a regional cache, D1 tag cache, DO queue |
| `scripts/cf.sh` | Build, preview, deploy and upload with rules 1 to 4 enforced |
| `scripts/cf-trace-extra.mjs`, `lib/cloudflare/drizzle-kit-stub.cjs` | Rule 6 |
| `next.config.mjs` | Security headers, HSTS (Cloudflare build), `noindex` on `*.workers.dev`, the drizzle-kit alias |
| `public/_headers` | Static-file headers (rule 8) |

Cloud resources (Malik's account, `16e71571…`): Worker `lisbon-project`, R2
bucket `lisbon-project-opennext-cache` (lifecycle rule expires old builds after
30 days), D1 `lisbon-project-tag-cache` (`7eba46a1-…`, weur). Placement is
`aws:eu-west-3`, next to Supabase in Paris: every uncached request makes
several database round trips, and removing placement measured slower.

## Deploying

### Workers Builds (the normal path)

Every push to `main` builds and deploys. Workers & Pages → **lisbon-project** →
Settings → Build:

| Setting | Value |
| --- | --- |
| Repository / production branch | `malikpiara/lisbon-project-admin-hub` / `main` |
| Build command | `pnpm run cf:build` |
| Deploy command | `bash scripts/cf.sh deploy` (fills the R2 cache and D1 table, then deploys) |
| Non-production branch builds | **Off.** Branch previews are a second Worker, `lisbon-project-preview` (see below), not Worker versions or Worker Previews. Preview locally with `pnpm run cf:preview`. |
| API token | A user token with **D1 Edit** (plus Workers Scripts Edit, R2 Edit). `opennextjs-cloudflare deploy` writes the D1 tag table before `wrangler deploy`; Cherrydock's first token needed D1 added by hand. Check it first if a deploy fails at the D1 step. |
| Build variables | `NEXT_PUBLIC_SITE_URL` = `https://lp.lisboaux.com`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (rule 4), and as **secrets**: `DATABASE_URI`, `PAYLOAD_SECRET` (the build prerenders from Payload), `GOOGLE_CALENDAR_API_KEY`, `GOOGLE_CALENDAR_ID` (`/calendar` is prerendered; without them it ships empty until its 5-minute revalidate). Not `CLOUDFLARE_API_TOKEN` (rule 3). |

pnpm comes from `packageManager` in `package.json`.

The build's fetch cache (uploaded to the private R2 bucket, never to the Worker
or the browser) stores Google Calendar request URLs, which carry the API key.
Vercel's data cache held it the same way.

### Manual

```bash
NEXT_PUBLIC_SITE_URL=https://lp.lisboaux.com pnpm run cf:deploy
```

Use `pnpm run cf:deploy`, not `pnpm deploy` (pnpm's own built-in command).

### The preview Worker (2026-10-07)

`lisbon-project-preview` serves a branch for client review at
**https://lisbon-project-preview.upfra-me.workers.dev** (workers.dev only, no
route; `next.config.mjs` marks every `*.workers.dev` host `noindex`). It is the
`preview` *environment* in `wrangler.jsonc`: a separately named Worker with its
own cache bucket (`lisbon-project-opennext-cache-preview`), tag database
(`lisbon-project-tag-cache-preview`, both WEUR) and Durable Object, deployed
through the same OpenNext flow as production:

```bash
pnpm run cf:deploy:preview   # = cf.sh build preview && cf.sh deploy preview
```

`build preview` sets `DEPLOY_ENV=preview` for the build and defaults
`NEXT_PUBLIC_SITE_URL` to the workers.dev URL; `deploy preview` fills the
preview Worker's bucket and tag table, then deploys it. Secrets are the
production set, uploaded with `--env preview`; `DATABASE_URI` must point at the
**transaction pooler (port 6543)**, as production does, so two Workers never
share the session pooler's 15-client cap (the 2026-07-04 outage).

Why not Cloudflare's Worker Previews (Sept 2026)? They do support Durable
Objects now, so the earlier note here was out of date, but a Preview's service
bindings resolve to the *production* Worker, and both OpenNext revalidation
queues call the site back through `WORKER_SELF_REFERENCE`. A Preview would
refresh production's cache and leave its own stale.

Two things to know:

- **Environments inherit `routes`.** The first preview deploy tried to attach
  production's `lp.lisboaux.com/*` route to the preview Worker; Cloudflare
  refused it as already in use (code 10020), so nothing moved. The environment
  now sets `routes: []` explicitly. Keep it that way for any new environment.
- **It is production's database.** Public pages, editor drafts and "submit for
  review" are fine. Anything the branch adds to the schema (for example the
  Site text global on `limoncello`) must be pushed to production before that
  admin page can save on the preview; the public site falls back to defaults.
- Production's deploy prints a warning that environments are defined and none
  was selected; it still deploys the top-level (production) Worker.

Verified on 2026-10-07: pages 200, `/cms-admin` and `/api/users/me` answer
(database reachable), `x-robots-tag: noindex`, articles served from the
preview's own cache, production's tag table unchanged before and after. To
automate it for a review round, connect a second Workers Builds project to the
same repository with the branch as its production branch and
`bash scripts/cf.sh deploy preview` as the deploy command.

### Margin (team review comments)

Margin is RoundTwenty's review layer: one script from `margin.roundtwenty.com`
that lets people holding a review link comment on any page, `/admin` included.
`lib/margin.js` decides which builds carry it. The preview Worker always does,
and so does production while lp.lisboaux.com is the team's review copy
(2026-10-08). Set `MARGIN_ON_PRODUCTION` to `false` at public launch. The same
switch adds Margin's origin and its curtain's Google Fonts to the CSP, and
every build stamps the commit in `<meta name="margin-version">`.

A visitor without a link sees nothing, unless the round has a passcode: then
Margin's curtain covers the page until they type it. Rounds, origins and
passcodes are managed from the margin repository (`pnpm review …`, see its
README); a new address must be added to the round with `pnpm review origin add`.

## Configuration and secrets

Runtime values are Worker secrets and survive deploys. `.env.local` is the
source; `--env-file /dev/null` keeps wrangler from using it for its own login
(rule 3) while the positional file is still read as the secrets to upload:

```bash
pnpm exec wrangler secret bulk .env.local --env-file /dev/null
```

Secrets set on 2026-09-28: `DATABASE_URI`, `PAYLOAD_SECRET`,
`MAILERLITE_API_KEY`, `GOOGLE_CALENDAR_API_KEY`, `GOOGLE_CALENDAR_ID`,
`POSTHOG_PERSONAL_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`,
`CLOUDFLARE_AI_MODEL`, `CONVERSATION_SYNTHESIS`. What each one does:
[ENVIRONMENT.md](ENVIRONMENT.md). Non-secret settings (`DATABASE_POOL_*`,
`DEPLOY_ENV`) are `vars` in `wrangler.jsonc`.

`pnpm run cf:preview` runs the built Worker locally with `.dev.vars` pointed at
`.env.local`, so, like `pnpm dev`, **it talks to the production database**.

The preview Worker's secrets are set the same way with `--env preview`, from a
copy of `.env.local` whose `DATABASE_URI` uses port 6543 (never upload the
session-pooler URL to a second Worker).

## Integrations that call the site

None are live. `/webhooks/chatbot-log` exists but no Zap posts to it
([ANALYTICS.md](ANALYTICS.md)). If one is added, give it an `https://` URL:
Cloudflare answers `http://` with a 301, which many webhook clients follow by
turning the POST into a GET.

## Verify a deploy

```bash
H=https://lp.lisboaux.com
for u in / /services /calendar /sitemap.xml /robots.txt /llms.txt /login; do
  curl -s -o /dev/null -w "$u %{http_code}\n" $H$u; done   # all 200
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" $H/admin   # 307 → /login
curl -sI $H/ | grep -i -E "strict-transport|x-robots"              # HSTS, no noindex
A=$(curl -s $H/ | grep -o '/_next/static/[^"]*\.js' | head -1)
curl -sI "$H$A" | grep -i cache-control                             # max-age=31536000, immutable
```

Then an admin edit: change something small in `/admin`, and check it shows on
the public page (the D1 tag cache invalidation path). Worker errors and CPU are
in Workers Logs (lisbon-project → Observability).

## Cutover and Vercel's retirement (2026-10-04)

1. Fresh build deployed as version `396eea84` with the `lp.lisboaux.com/*`
   route, while `lp` was still a DNS-only CNAME to Vercel (the route inert).
2. ~12:05 UTC: `lp` switched to **Proxied**, an in-place edit with no DNS gap.
   Checked: every route matched Vercel, HSTS present, no `noindex`, no Worker
   errors, and an admin edit reached the public page.
3. ~12:30 UTC: Vercel had served no request since the switch. `lp` retargeted
   to `lisboaux.com` (still Proxied), the Vercel project deleted
   (`lisbon-project-admin-hub.vercel.app` now answers `DEPLOYMENT_NOT_FOUND`),
   and Vercel's GitHub app removed from the repo.

## Rollback

- **There is no Vercel to go back to.** Switching `lp` to DNS only now points it
  at the `lisboaux.com` origin, not at this site. Keep it Proxied.
- **A bad build:** revert its merge on `main` (Workers Builds deploys the
  revert), or redeploy a known-good commit by hand (`pnpm run cf:deploy`).
  Avoid `wrangler rollback` to an old version: its cache prefix holds the data
  it was built with, so it brings back stale content.

## Performance

Measured before the cutover on the `workers.dev` URL: cached-page Worker wall
time p50 132–184 ms, CPU p50 14–44 ms, Worker size 6.4 MB gzipped (10 MB
limit), startup 36–39 ms. Warm TTFB from Lisbon is close to Vercel's (150–250 ms
both). The cost floor is OpenNext running the Worker and a D1 tag check on every
HTML request, where Vercel served prerendered HTML from its CDN.

The Vercel baseline for this site (PostHog project 208396, 30 days to
2026-09-27): LCP p50 928 ms, p75 1,706 ms, p90 3,390 ms. Compare from
2026-10-04 12:05 UTC, and treat it with care: traffic is a few visitors a day.

## Open

- **Not ported from Cherrydock:** the stale-build reload stamp (its PR #91),
  which stops prefetch storms from tabs left open across a deploy. Low risk at
  this traffic.
- `/cms-admin` answers its not-found page with status **200**. This predates
  the move (Vercel did the same).
- Cloudflare now recommends vinext over OpenNext for new Next apps; a re-check
  is scheduled for 2026-11-01.
