# SEO audit

_Audited 2026-07-05. Scope: the public site (`app/(frontend)/(site)`). The
`/admin`, `/cms-admin`, `/api` and `/login` surfaces are intentionally kept out
of search indexes._

The goal behind this audit is concrete: **the more people who find the Lisbon
Project when searching for migrant/refugee services in Lisbon, the more the
organisation can help — and the more likely it is to attract support and
donations.** Everything below is weighed against that outcome.

## TL;DR

The site had solid per-page titles on service routes but was missing the whole
SEO baseline: no `metadataBase`, no sitemap, no robots, no structured data, no
social image, and an admin-flavoured default title leaking onto public pages.
The baseline is now in place and verified. **One high-impact issue is
deliberately left for a larger, separate task: the public content pages render
client-side from `localStorage`, so crawlers see empty pages** (see
[Known limitation](#known-limitation-client-rendered-content)).

## What was implemented this session

| Area | Change | File |
| --- | --- | --- |
| Canonical host | Env-driven `SITE_URL` + org facts, one source of truth | `lib/site.ts` |
| metadataBase | Set on the root layout so canonical/OG URLs resolve absolutely | `app/(frontend)/layout.js` |
| Default title/description | Replaced the leaked `… · Admin Hub` default with a public, mission-based title + a `%s · The Lisbon Project` template | `app/(frontend)/layout.js` |
| Canonicals | Added `alternates.canonical` to home, `/services`, service + topic pages, privacy, calendar | those pages |
| Open Graph / Twitter | Default OG + Twitter card metadata; dynamic branded social image | `app/(frontend)/layout.js`, `app/(frontend)/(site)/opengraph-image.tsx` |
| Structured data | `NGO` + `WebSite` site-wide; `BreadcrumbList` on `/services`, category + topic pages | `lib/site.ts`, `components/seo/json-ld.tsx`, `(site)/layout.js`, service pages |
| Sitemap | `sitemap.xml` enumerated from the same seed the routes use | `app/sitemap.ts` |
| Robots | `robots.txt` allowing the public site, disallowing app surfaces | `app/robots.ts` |
| Manifest | Web app manifest (installable, themed) | `app/manifest.ts` |
| Services hub | New server-rendered `/services` index — a crawlable link map of every category (also fixes the 404 "Browse services" dead link) | `app/(frontend)/(site)/services/page.js` |
| Noindex | Admin subtree + login set `robots: { index: false }`; admin titles kept off the public brand template | `admin/layout.js`, `login/page.jsx` |

### Verified (dev server, 2026-07-05)

- `GET /robots.txt` → 200, correct allow/disallow + sitemap/host lines.
- `GET /sitemap.xml` → 200, valid XML, home + `/services` + every category + topic.
- `GET /manifest.webmanifest` → 200, `application/manifest+json`.
- Home `<title>` = "The Lisbon Project — services and support for migrants and
  refugees in Lisbon"; canonical → `https://lp.lisboaux.com/`; JSON-LD parses as
  `[NGO, WebSite]`; `og:image`/`twitter:image` → 200 `image/png`.

## Known limitation — client-rendered content

**Severity: high. Deliberately out of scope for this pass (it is a large,
separate task).**

The public home and service/article pages are **client components** that read
content from the `localStorage` store (`useAdmin()`). On first load they render
the seed defaults into HTML, but the category/article detail pages return `null`
until hydration — so a crawler that doesn't execute JS (or gives up early) sees
an empty page body. Titles and descriptions (from `generateMetadata`) and the
JSON-LD **are** in the server HTML, so the pages are _identifiable_; their _body
content_ largely is not.

**Recommended fix (tracked, not done here):** wire the public read-path to render
from Payload (or at least from `lib/services-data` on the server) so the article
body ships in the initial HTML. This is the same "wire public pages to Payload"
task already noted in `docs/ADMIN-HANDOVER.md` and `docs/ARCHITECTURE.md`. Until
then, the new **server-rendered `/services` hub** gives crawlers a complete,
indexable map of the category tree even though the leaves are client-rendered.

## Content items for the Lisbon Project team

These are **content/brand decisions**, not code — flagged rather than changed
(the platform is maintained separately from the LP editorial team):

- **The public home hero and site header read "Admin Hub".** This is an internal
  label showing on the public site; it should be the organisation's name/brand.
  (The SEO _title_ has been set to a public value; the visible heading is a copy
  decision.)
- **Placeholder body copy.** Service topics use Lorem ipsum and every category
  currently shares the same intro sentence, so category pages have near-identical
  descriptions. Real copy will materially improve rankings and click-through.
- **Social links are `#` placeholders** (`site-footer`). Once real profiles
  exist, add them to `sameAs` in `lib/site.ts` — it strengthens the entity graph.
- **Privacy contact email is a TODO** (`privacy/page.js`).
- **Portuguese content.** The audience is migrants/refugees in Portugal; a PT
  translation (and `hreflang` alternates) would widen reach significantly.

## Backlog (nice-to-have, low priority)

- Per-article `opengraph-image` overrides once real article art exists.
- `FAQPage` structured data on article pages (they already have a FAQ section) —
  wait until the FAQ content is real, not Lorem.
- Localised sitemap `alternates` once PT pages exist.

## Configuration

Set `NEXT_PUBLIC_SITE_URL` per environment (no trailing slash). It drives
`metadataBase`, canonicals, the sitemap, robots and JSON-LD. Fallback:
`https://lp.lisboaux.com`.
