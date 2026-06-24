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
- `.env.example` / `.env.local` — `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`.
