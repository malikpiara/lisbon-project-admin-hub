# Analytics (PostHog)

Product analytics for the Lisbon Project site, instrumented with PostHog (EU
cloud). Two questions drive it:

1. **Which services / information do unique users visit the most?**
2. **What do people search for in "All Contacts"?** — so we can learn what people
   need that we may not yet list.

## Ownership & key constraints (read before touching analytics)

- **The PostHog account belongs to RoundTwenty, not the Lisbon Project.** The project
  "Lisbon Project" (id `208396`, EU) lives under the **RoundTwenty** organization
  (Malik's umbrella brand). **There is no separate PostHog org/account for the Lisbon
  Project.** Everything analytics — the project, dashboards, the ingestion
  transformation, the Personal API keys, and the Zapier↔PostHog connection — is owned by
  and coupled to Malik's RoundTwenty account. *Handoff implication:* if the Lisbon
  Project ever needs to own its analytics independently, that means standing up a
  Lisbon-Project-owned PostHog org and migrating (new project, new Zapier connection, new
  dashboards/keys). Today it's a maintained-on-their-behalf arrangement, consistent with
  Malik being the external builder, not org staff.

- **Nonprofit / free-tier constraint.** The org can't pay for tooling right now, which
  drove the chatbot-capture design below: the **free Zapier plan can't publish a Zap that
  uses "Webhooks by Zapier"** (a premium app), and free Zaps are capped at 2 steps. So we
  used PostHog's own **free** Zapier app ("Capture Event") + a **free** PostHog ingestion
  transformation instead of the `/webhooks/chatbot-log` route. Any future "just add a
  webhook / a premium step" idea hits this wall. (Note: Zapier *Chatbots* "Pro" is a
  separate plan from the Zaps *automation* plan, which is Free.)

- **hog transformation VM has no regex-replace.** `replaceRegexpAll`/`replaceRegexpOne`
  are unsupported at runtime and `match()` returns a boolean — so in-transcript PII
  redaction is **tokenize-and-swap only** (catches emails + single-token phone numbers;
  not spaced phones or free-text names). Retention + restricted access + the `/privacy`
  notice are the real backstop.

- **Verify outcomes, not tool status.** Zapier reported "Ok" on a capture whose event was
  stamped with the conversation's *Created At* (a Jul 1 sample), not ingestion time — so
  it fell outside a naive "last N hours" check though it had landed fine. Always confirm
  in PostHog, and mind the query window.

## Status

- **Instrumentation: done** (SDK + provider + events). It is **opt-in** — nothing
  is captured until `NEXT_PUBLIC_POSTHOG_KEY` is set, so the app runs fine without it.
- **Live (2026-06-23):** project **"Lisbon Project"** (id `208396`, EU) created;
  the `phc_` key is in `.env.local`; ingestion verified end-to-end (`$pageview` +
  `contacts_search` confirmed landing). Session replay is opted out at the client.
- **Dashboard built:** [Lisbon Project — site insights](https://eu.posthog.com/project/208396/dashboard/769373)
  with the four insights below.
- **In-app dashboard wired (2026-07-03):** `/admin/insights` reads live counts
  from the **Query API** server-side (`lib/posthog-insights.js`) — topics, top
  searches, and a **"Searches we couldn't answer"** content-gaps panel. Needs a
  Personal API Key (`POSTHOG_PERSONAL_API_KEY`, scoped `query:read`); without it
  the two demo panels fall back to sample data and the gaps panel stays empty.
- **Chatbot data surfaced (2026-07-03):** a dedicated **`/admin/conversations`**
  route + a summary tile on `/admin/insights` read `chatbot_conversation_logged`
  from the Query API, and a PostHog dashboard tile ("Assistant — opens vs
  conversations logged", insight `xyCgvZa1`) tracks it. **This pipeline is live**
  (see "Chatbot conversation logging" below) — transcripts flow capture → PostHog
  → visible on `/admin`. `/admin/conversations` additionally synthesises each
  transcript into a need / status / summary (a no-network heuristic, or Cloudflare
  Workers AI when enabled — see [ENVIRONMENT.md](./ENVIRONMENT.md)).

## Naming convention (Amplitude object-action)

Events follow **`object_action`, verb in past tense, `snake_case`** (e.g.
`service_viewed`, `contacts_searched`). Properties are `snake_case` and descriptive.
Consistency is the rule that matters most — PostHog, like Amplitude, treats
`contacts_searched` and `contacts_search` as **different** events, so casing/tense
drift silently splits a metric. `$`-prefixed events (`$pageview`) are PostHog
built-ins — don't rename them.

## Tracking plan

| Event | Trigger | Properties (type) |
| --- | --- | --- |
| `$pageview` | every App Router navigation | `$current_url` (str), `$pathname` (str) — PostHog built-in; manual capture (App Router doesn't auto-fire SPA pageviews) |
| `service_viewed` | a service category page renders (`/services/[slug]`) | `service_slug` (str), `service_name` (str) |
| `topic_viewed` | a topic/article page renders (`/services/[slug]/[topic]`) | `service_slug`, `service_name`, `topic_slug`, `topic_name` (all str) |
| `contacts_searched` | user searches the All Contacts table (debounced 800ms) | `search_query` (str, lowercased), **`results_count`** (int), `category_filter` (str), `list_name` (str) |
| `chatbot_opened` | user opens the help chatbot via our launcher | — (engagement only; no message content) |
| `chatbot_closed` | user closes the chatbot panel (X or Esc) | — |
| `chatbot_conversation_logged` | a chatbot conversation ends → Zapier POSTs the transcript to `/webhooks/chatbot-log` | `conversation_id` (str), `transcript` (str, redacted), `$process_person_profile: false` |

`results_count` is deliberate: a `contacts_searched` with **`results_count = 0`** is
someone looking for something we don't list — the highest-signal "learn from it" data.

> **Why `service_viewed`/`topic_viewed`, not `$pageview` URL parsing?** Semantic
> events carry clean `service_name`/`topic_name` properties, survive URL changes, and
> are discoverable in the catalog — the Amplitude-recommended way to model a key
> product action. `$pageview` is still captured for general traffic.

## Dashboard insights ([Lisbon Project — site insights](https://eu.posthog.com/project/208396/dashboard/769373))

1. **[Most-visited services](https://eu.posthog.com/project/208396/insights/sAnOzn1L)** — `service_viewed`, unique users, breakdown `service_name`.
2. **[Most-viewed information / topics](https://eu.posthog.com/project/208396/insights/GhLOtOmh)** — `topic_viewed`, unique users, breakdown `topic_name`.
3. **[Top All Contacts searches](https://eu.posthog.com/project/208396/insights/XDjqtSrd)** — `contacts_searched`, breakdown `search_query`.
4. **[Searches with no results (content gaps)](https://eu.posthog.com/project/208396/insights/NVAgKLDu)** — `contacts_searched` where `results_count = 0`, breakdown `search_query`.

## Team alerts (PostHog → Zapier)

The dashboard is a **pull** surface — someone has to open it. For the one signal
worth acting on the *moment* it happens — a **search that returned nothing** —
push it to the team via Zapier. (It also lands in-app on `/admin/insights` under
"Searches we couldn't answer", so the insight exists even before anyone wires a
channel.)

PostHog has a first-class **Zapier destination** (realtime, filterable by event
*and* property), so **no code on our side** — it's configured in the two
dashboards:

1. **Zapier:** new Zap → trigger **Webhooks by Zapier → Catch Hook**. Copy the
   custom webhook URL it gives you.
2. **PostHog → Data pipeline → Destinations → New → Zapier** (or generic
   Webhook). Paste the Catch Hook URL. **Filter:** event `contacts_searched`,
   property `results_count = 0`. Only the matching events leave PostHog.
3. **Zapier action:** route to wherever the team lives — a Slack message, an
   email, or an *append-row* in a Google Sheet. Surface `search_query` +
   timestamp, e.g. _"Someone searched 'emergency shelter' — we list nothing."_

> **The destination is a last-mile choice.** The durable part is the pipe
> (PostHog → Zapier). Whether it ends in Slack, email, or a Sheet is one Zapier
> step, changeable any time without touching code or PostHog — so it can be
> decided (or handed to the org) after launch.

> **Privacy.** `search_query` is free text a visitor typed; on a migrant/refugee
> site it can carry a name or sensitive term. Send it only to a team-restricted
> channel and keep the short-retention discipline used elsewhere here.

> **The loop to measure.** This is a testable hypothesis, not a fire-and-forget:
> alerting the team to gaps → they add the missing contact → zero-result searches
> should *fall* over time. Watch insight #4 to confirm it's working.

_Variant (not wired):_ a weekly digest — Zapier **Schedule** trigger → **Webhooks
(POST)** to the Query API (`/api/projects/208396/query/`, HogQL) → email the team
a top-searches/top-topics summary. Same Query API this dashboard already uses.

## Chatbot conversation logging — LIVE via PostHog's Zapier app (2026-07-03)

**What actually shipped (free path):** the free Zapier plan can't publish a Zap using
**Webhooks by Zapier** (a premium app), so `/webhooks/chatbot-log` (below) could not be
used. Instead the live pipeline is: **Carebot "Run Zap → end of conversation" → PostHog's
own Zapier app "Capture Event"** (a standard, non-premium app) → event
`chatbot_conversation_logged` (distinct_id = Chatbot Session Id, property `transcript` =
Full Conversation Transcript, plus `chatbot_name`; Timestamp = the conversation's Created
At). Zap id 371307022 ("Chatbot conversation ends"), published, 2 steps, €0/mo.

**Redaction moved into PostHog** (since Zapier→PostHog is direct, our route's `redact()`
can't run): a free **ingestion transformation** ("Redact PII from chatbot transcripts",
hog function `019f291e-…`) tokenizes the transcript and swaps tokens matching an email
regex or 6+ consecutive digits → `[email]`/`[phone]`. NOTE: the hog transformation VM has
**no regex-replace** (`replaceRegexpAll`/`One` both unsupported at runtime) and `match`
returns a boolean, so tokenize-and-swap is the only technique — it catches emails +
single-token phones but **not spaced phones or free-text names**. Retention + restricted
project access + the `/privacy` notice remain the real backstop.

**The `/webhooks/chatbot-log` route below is retained but unused** — it's the cleaner
design (redact-in-transit) and the path to switch to if the org ever moves to a paid
Zapier plan; `/admin/conversations` reads `chatbot_conversation_logged` from PostHog
regardless of which path produced it.

## (Reference) Original design: our own webhook (Zapier → PostHog)

The help chatbot is a Zapier Chatbot embedded in a **cross-origin iframe**, so its
message text is invisible to our client JS (same-origin policy). We capture at two
layers:

- **Engagement (client):** `chatbot_opened` / `chatbot_closed`, fired from our own
  launcher (`components/site/zapier-chatbot.jsx`). No message content.
- **Content (server):** the raw transcript, logged **from Zapier**, never the browser.

### How the transcript reaches PostHog

1. **Zapier chatbot builder → Run Zap** logic (fires when a conversation *ends* — the
   grain is a whole transcript, not per-message/real-time). Hands the Zap the full
   transcript + metadata.
2. **Zap action → Webhooks by Zapier (POST)** to `https://<site>/webhooks/chatbot-log`,
   header `Authorization: Bearer <CHATBOT_LOG_SECRET>`, JSON body like
   `{ "conversation_id": "…", "transcript": "…" }`.
3. Our handler (`app/(frontend)/webhooks/chatbot-log/route.js`) checks the secret,
   redacts obvious emails/phones, and forwards to PostHog `/capture/` as
   `chatbot_conversation_logged` with `$process_person_profile: false`.

> **Why our own webhook, not Zapier → PostHog directly?** One place *in code we own*
> to authenticate, redact, and keep person profiles off — rather than trusting a
> Zapier UI step with special-category data.

### Non-negotiables (consent + retention)

- **Disclosure.** This logs **regardless of the site's PostHog opt-in** (it runs on
  Zapier, not the browser). Disclose in the chatbot greeting *and* the privacy policy
  that conversations may be stored — on a migrant/refugee site this is special-category
  data under RGPD, so notice is mandatory.
- **No cross-linking.** `distinct_id` is the conversation id; these events can't tie to
  the web-session person (the iframe can't see our distinct_id). Standalone by design.
- **Short retention + restricted access.** Cap transcript retention and limit who can
  view the PostHog project.

### Setup status (2026-07-03 — pipeline wired in production)

- [x] `CHATBOT_LOG_SECRET` set in Vercel **Production** (the raw secret; the Zap
      sends `Bearer <same secret>`). Endpoint live at
      `https://lp.lisboaux.com/webhooks/chatbot-log`. Note: the raw secret and the
      Zap's `Bearer …` value must match byte-for-byte — a trailing newline on the
      Vercel value is the classic 401 cause; set both from one clean clipboard value.
- [x] Zap built — Carebot **Logic → "Run Zap" (end of conversation)** trigger →
      **Webhooks by Zapier (POST)** to the endpoint, Payload Type **JSON**, body
      `{ conversation_id, transcript }` mapped from the conversation fields.
- [x] **Privacy-policy disclosure is LIVE** at `/privacy` (linked in the site
      footer): states conversations may be stored, PII-redacted, team-only, kept
      for a limited period. This is the baseline written notice.
- [ ] **⚠️ REQUIRED BEFORE THE SITE IS OFFICIALLY RELEASED TO THE PUBLIC —
      in-chat greeting disclosure.** Add the RGPD notice to **Carebot's greeting**
      (Zapier Chatbots → Instructions → Greeting), ideally in all five offered
      languages (EN/FR/PT/ES/AR). **Deliberately deferred on 2026-07-03**; the
      `/privacy` page is the baseline, this greeting line is the stronger
      in-context notice. Do **not** promote/launch the site publicly without it.
- [ ] Set a **retention window** in PostHog for `chatbot_conversation_logged`.
- [ ] Replace the placeholder **contact email** on `/privacy` with the real one
      before launch.

## Privacy / GDPR (decide before launch)

- Configured with **`person_profiles: 'identified_only'`** — anonymous visitors get
  no person profile (lighter footprint for a public NGO site serving vulnerable people).
- **Open decision:** PostHog still uses cookies for anonymous IDs. For an EU site you
  likely need either a **cookie-consent banner** gating PostHog, or **cookieless mode**
  (`persistence: 'memory'`). Not implemented — it's a product/legal call. Note that
  `contacts_searched.search_query` could contain personal info someone types;
  consider that when reviewing.

## Files

- `components/analytics/posthog-provider.tsx` — init (guarded on the env key) + manual `$pageview`.
- `app/(frontend)/layout.js` — wraps the public app in `<PostHogProvider>`.
- `components/shared/contacts-section.tsx` — the `contacts_search` capture.
- `components/site/zapier-chatbot.jsx` — `chatbot_opened` / `chatbot_closed` engagement events.
- `app/(frontend)/webhooks/chatbot-log/route.js` — server sink for Zapier chatbot transcripts → PostHog.
- `.env.example` / `.env.local` — `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, `CHATBOT_LOG_SECRET`.
