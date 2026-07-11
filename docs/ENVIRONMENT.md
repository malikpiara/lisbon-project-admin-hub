# Environment variables — the whole surface, explained

**Last updated:** 2026-07-11 · owner: Malik

A lot of variables looks alarming. It isn't. This app is one shell in front of
several independent services (Postgres, PostHog, MailerLite, Google Calendar,
Cloudflare AI), and **each service brings its own two or three vars**. So the
list is long, but it's not tangled: every variable belongs to exactly one
subsystem, and losing one only disables that subsystem.

**The reassuring version:**

- **Only two variables are truly required** for the app to boot: `PAYLOAD_SECRET`
  and `DATABASE_URI`. Everything else is a **feature flag that degrades
  gracefully** — leave it unset and that one feature turns off (or falls back),
  nothing crashes.
- **Secrets are clearly marked** below and in Vercel (the padlock / "Sensitive"
  tag). Only those must be protected; the rest are safe to read.
- **You can turn features on one at a time.** The app is designed so a half-
  configured environment still runs — useful for local dev and staged rollout.

The canonical, copy-pasteable list with per-variable setup notes lives in
[`.env.example`](../.env.example). This page is the map: what each one is _for_,
whether it's required, and whether it's a secret.

---

## Read these warnings once

- **Dev points at the production database.** `DATABASE_URI` in your local
  `.env.local` is the **live Supabase prod** DB. `pnpm dev` and `tsx scripts/*`
  read and write production. Dry-run and back up before any destructive script.
- **Secrets never get `NEXT_PUBLIC_`.** That prefix ships a value to the browser
  bundle. Only genuinely public values (the site URL, the write-only PostHog
  `phc_` key, the PostHog host) may carry it. A secret with that prefix is a leak.
- **Feature flags fail quiet, by design.** A missing optional var disables its
  feature silently rather than erroring. That's good for resilience but means a
  feature can be "off" simply because a var wasn't set in that environment — check
  here first before debugging code.
- **Set vars per environment.** In Vercel, add each to **Production** (and
  **Preview** if you want PR previews to exercise it). A var set only locally does
  nothing in prod.

---

## Required to boot

| Variable | Secret | What it is |
|---|---|---|
| `PAYLOAD_SECRET` | 🔒 | Signs Payload sessions/tokens. Generate with `openssl rand -hex 32`. Without it the CMS and every `/admin` page fail to start. |
| `DATABASE_URI` | 🔒 | Supabase Postgres connection string. **Prod on Vercel uses the transaction pooler (`:6543`); local/migrations use session/direct.** See `.env.example` for the full rationale — the wrong endpoint has bitten deploys. |

`NEXT_PUBLIC_SITE_URL` isn't strictly required (it falls back to
`https://lp.lisboaux.com`) but should be set per environment — it drives
canonical URLs, the sitemap, and JSON-LD.

## Optional — feature flags (unset = feature off / fallback)

| Variable(s) | Secret | Turns on | If unset |
|---|---|---|---|
| `GOOGLE_CALENDAR_API_KEY`, `GOOGLE_CALENDAR_ID` | 🔒 / — | The public `/calendar` feed | Calendar is empty |
| `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` | — | Product analytics (client `$pageview`, events) | SDK is a no-op, no tracking |
| `POSTHOG_PERSONAL_API_KEY`, `POSTHOG_PROJECT_ID` | 🔒 / — | Server reads for `/admin/insights` **and** `/admin/conversations` | Dashboards show sample/empty data |
| `CHATBOT_LOG_SECRET` | 🔒 | The Zapier → PostHog transcript webhook (`/webhooks/chatbot-log`) | Webhook refuses all requests (503) |
| `MAILERLITE_API_KEY`, `MAILERLITE_GROUP_ID` | 🔒 / — | Newsletter signups → MailerLite | Signups saved to the Supabase `subscribers` table instead (nothing lost) |
| `CONVERSATION_SYNTHESIS`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_AI_MODEL` | — / — / 🔒 / — | AI synthesis on `/admin/conversations` (need + status + summary per chat) | Page uses the no-network heuristic (simpler titles, no "assistant fell short" judgement) |

## Seed / tuning (rarely touched)

| Variable | Secret | Notes |
|---|---|---|
| `PAYLOAD_SEED_EMAIL`, `PAYLOAD_SEED_PASSWORD` | — / 🔒 | Only used by `pnpm seed:payload` to create the first admin. **Rotate the seed password before/after launch** (it's a known default). |
| `DATABASE_POOL_MAX` | — | Per-process pg pool size (default 3). Keep small — the Supabase pooler does the real pooling. |

---

## The Conversation AI subsystem (the newest, and why it has four vars)

`/admin/conversations` reads help-assistant transcripts from PostHog and turns
each into a **need / theme / status / one-line summary** so the team can see what
migrants actually ask for and where content or support is missing. It's the
newest subsystem, so here's the shape of it:

- **It's optional and off by default.** Unset `CONVERSATION_SYNTHESIS` (or set it
  to anything but `ai`) and the page runs on a deterministic heuristic. No secret,
  no network, still useful — just less nuanced.
- **Four vars because it's a full provider integration:** a switch
  (`CONVERSATION_SYNTHESIS=ai`), an account (`CLOUDFLARE_ACCOUNT_ID`), a secret
  (`CLOUDFLARE_API_TOKEN`), and a model (`CLOUDFLARE_AI_MODEL`). Only the token is
  sensitive.
- **Analyse-once cache.** Each transcript is sent to the model a single time, ever;
  the result is stored in the `conversation-insights` Postgres table
  (content-addressed by a hash of the transcript). Reloads read from Postgres.
  So AI cost tracks *new* conversations, not page views.
- **Caveat — changing the model or prompt.** The cache means old conversations
  keep their earlier analysis. To re-judge the whole set, run
  `pnpm tsx scripts/purge-conversation-insights.ts --confirm` (dry-runs without
  `--confirm`). It hits the **production** database — run it deliberately.
- **Caveat — model choice.** Use an instruction-tuned model that emits JSON
  directly (Llama 4 Scout). "Reasoning" models (e.g. Gemma) burn the token budget
  thinking and return no JSON, so synthesis silently falls back to the heuristic.
- **No migration needed on deploy.** Because dev pushes schema to the same
  Supabase prod DB, the `conversation-insights` table already exists in
  production.

Related: [ANALYTICS.md](./ANALYTICS.md) (how transcripts reach PostHog),
[ARCHITECTURE.md](./ARCHITECTURE.md) (data flow), [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md)
(deploy steps).
