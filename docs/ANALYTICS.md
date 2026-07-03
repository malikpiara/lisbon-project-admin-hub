# Analytics (PostHog)

Product analytics for the Lisbon Project site, instrumented with PostHog (EU
cloud). Two questions drive it:

1. **Which services / information do unique users visit the most?**
2. **What do people search for in "All Contacts"?** — so we can learn what people
   need that we may not yet list.

## Status

- **Instrumentation: done** (SDK + provider + events). It is **opt-in** — nothing
  is captured until `NEXT_PUBLIC_POSTHOG_KEY` is set, so the app runs fine without it.
- **Live (2026-06-23):** project **"Lisbon Project"** (id `208396`, EU) created;
  the `phc_` key is in `.env.local`; ingestion verified end-to-end (`$pageview` +
  `contacts_search` confirmed landing). Session replay is opted out at the client.
- **Dashboard built:** [Lisbon Project — site insights](https://eu.posthog.com/project/208396/dashboard/769373)
  with the four insights below.

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

## Chatbot conversation logging (Zapier → PostHog)

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

### Setup checklist (blocked on Zapier dashboard access)

- [ ] Set `CHATBOT_LOG_SECRET` in `.env.local` (and as the Zapier webhook header).
- [ ] Build the Run Zap → Webhooks POST in Zapier.
- [ ] Add the logging disclosure to the chatbot greeting + privacy policy.
- [ ] Set a retention window in PostHog.

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
