# AI discoverability audit

_Audited 2026-07-05. Companion to [SEO-AUDIT.md](./SEO-AUDIT.md)._

**Why this matters:** people increasingly ask ChatGPT, Perplexity, Gemini and
Google AI Overviews questions like _"where can refugees get help in Lisbon?"_ or
_"how do I register for healthcare as a migrant in Portugal?"_. If the Lisbon
Project is cited in those answers, more people find help — and the charity gains
visibility that supports donations. AI systems **cite** sources; the job is to be
extractable, authoritative, and present where AI looks.

## What was implemented

| Move | Detail | Where |
| --- | --- | --- |
| `/llms.txt` | At-a-glance context file (per [llmstxt.org](https://llmstxt.org)) — org summary, key pages, every service category, contact facts. Env-driven + auto-generated from the seed. | `app/llms.txt/route.ts` |
| Entity graph | `NGO` + `WebSite` JSON-LD site-wide, `BreadcrumbList` on service routes — lets engines attribute pages to "The Lisbon Project" as an entity. | (from the SEO pass) |
| AI crawlers allowed | `robots.txt` uses `User-Agent: *` and only disallows app surfaces, so GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot/anthropic-ai, Google-Extended and Bingbot can all read + cite the public site. No AI bot is blocked. | `app/robots.ts` |
| Semantic HTML | Public pages use `<main>`, `<nav>`, headings, labelled links — a clean accessibility tree for the agents that read the DOM. | public components |

### Verified
- `GET /llms.txt` → 200, `text/plain`, correct org summary + full category list.

## The three pillars — where we stand

**1. Structure (extractability).** Good bones: semantic HTML, breadcrumb + entity
schema, a server-rendered `/services` hub. **Resolved (2026-07-07):** article
bodies used to render client-side — an AI crawler without JS saw titles + schema
but little body text, once the single biggest AI-visibility limiter. The public
pages now render **server-side from Payload** (SSG + revalidate), so crawlers get
full body content. See [SEO-AUDIT.md](./SEO-AUDIT.md).

**2. Authority (citability).** Princeton's GEO study ranks _citing sources_
(+40%) and _adding statistics_ (+37%) as the top citation boosters. The site's
guidance is currently Lorem-ipsum placeholder, so there are no real facts, stats
or sourced claims for AI to cite yet. **This is the highest-leverage content
work** once real copy lands (see below).

**3. Presence (be where AI looks).** ChatGPT cites Wikipedia (~7.8% of all
citations) and Reddit more than most first-party sites. Third-party presence is
outside this codebase but is the strongest lever for a small org.

## Recommendations for the Lisbon Project team

Content + presence work (not code — the platform is maintained separately):

1. **Replace placeholder copy with real, specific guidance.** Each article should
   open with a direct 40–60 word answer to the question a person actually asks,
   then steps/contacts. Specific, sourced info is what gets cited.
2. **Add "last updated" dates to guides.** AI weights freshness; undated content
   loses to dated content.
3. **Claim/curate third-party presence:** a Google Business Profile (the org has
   a physical Lisbon address + hours — high value for local AI answers), an
   accurate Wikipedia entry if notability allows, and profiles on nonprofit
   directories.
4. **Publish real social profiles** and wire them into `sameAs` (`lib/site.ts`) —
   strengthens the entity graph for the Knowledge Graph and AI.
5. **Consider a Portuguese version** with `hreflang` — much of the audience
   searches in Portuguese.

## Backlog (code, low priority)

- `FAQPage` structured data on article pages (they have a FAQ section already) —
  once the FAQ content is real, not Lorem.
- A `HowTo` schema for step-by-step processes (e.g. registering for an NIF /
  healthcare) once those guides are written.
