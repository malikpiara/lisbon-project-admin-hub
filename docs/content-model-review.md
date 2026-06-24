# Content model review — for the team sync

> **The content shapes below are the spec the backend has to satisfy. Let's lock the shapes before we lock the CMS.** Several of these surfaced late (during content entry, not wireframing); this doc turns "what else will surprise us?" into a checklist so the backend choice is made with eyes open.

Context: distilled from the June 22 status call (Ana = content, Rafael = design/DS, Malik = build). Some items were already handled; some are now fixed in the prototype; the rest are decisions for the sync.

## Content-capability matrix

For each content shape the real Lisbon Project content actually uses:

| Content shape | Status | Where it lives | Backend implication |
|---|---|---|---|
| Running text (paragraphs) | ✅ Supported | Section `body`, split on blank lines | Trivial in any backend |
| Bold intro line | ✅ Supported | Section `lead` | Trivial |
| Bulleted list | ✅ Supported | Section `bullets`, one per line | Trivial |
| **Numbered list (1, 2, 3)** | ✅ **Fixed in prototype** | New per-section "Numbered list" toggle (`ordered`) | Trivial — a boolean / list-type field |
| Single button per section | ✅ Supported | Section `cta` | Trivial |
| **Button → any URL (internal or external)** | ✅ **Fixed in prototype** | New "Button link" field (`ctaHref`); external opens in new tab | Trivial — a URL field. Replaces "links buried in text" |
| List of links ("Key Links", e.g. ePortugal) | ⚠️ Not built (was in the original) | — | Easy in any backend — a small repeatable `{label, url}` list. Recommended next addition |
| Multiple / inline buttons mid-text | ❌ Not | — | **Pushes toward a structured block model** (a button is a block in a sequence, not a fixed slot) |
| Table (Documents Required, art. 98, agreements) | ❌ Not — and the existing contacts table overflows on mobile | — | **Decision needed** — either rethink content, or a repeatable "card group" block. Tables don't fit mobile regardless |
| Mixed text → list → text in one section | ⚠️ Workaround only | Fixed order today: lead → body → bullets → button. Chain consecutive sections to interleave | **Pushes toward a block array** (ordered list of typed blocks) for true free-form bodies |
| FAQ accordion | ✅ Supported | `faqs` | Trivial |

**The lever:** everything in the "trivial" rows works in *any* backend — a markdown field or a few structured fields. The rows that break today's model — inline/multiple buttons, tables, free-form mixed blocks — are exactly the ones that argue for a **structured block model (portable-text / blocks array)** rather than a single rich-text blob. If the real content needs those, weight the backend choice toward one that models content as typed blocks; if not, a simpler rich-text field is enough. That is the content question the backend decision turns on.

## Already handled (no action)

- **Calendar off the homepage** — already on its own `/calendar` route.
- **Remove CoinCulture** — not present in code; it's a Figma-only cleanup.
- **Inline links in running text** — there was never inline-link support; the fix is buttons + a links list (above), which is the accessible, mobile-friendly pattern Rafael asked for.

## Fixed in the prototype (ready to demo)

1. **Numbered lists** — Step-by-Step guides now render 1, 2, 3; per-section toggle in the editor.
2. **Buttons that point anywhere** — sections can now link to an external portal (e.g. matrículas) or any internal page; external links open in a new tab.
3. **Working header menu** — the hamburger was a dead button; it now opens a menu (Home · Services & Information · Contacts · Calendar). Minimal by design — see decision 4.

## Decisions for the sync

1. **Tables.** No support today; tables also don't fit mobile. Cheapest path: rethink the content (Ana's team) so it isn't tabular. Heavier path: a repeatable "card group" block (Rafael's vertical-cards idea). *Recommend trying the content rewrite first as an exercise — it may be free.*
2. **Free-form mixed bodies (text → list → text).** Works today only by chaining sections. A true fix is a typed-block body — a backend-shaping decision, so decide it alongside the CMS, not before.
3. **A "Key Links" block** — small repeatable list of links per article, to replace links buried in prose. Low effort; worth adding once the backend is picked so it's built once.
4. **Final menu pattern.** Confirm whether to reuse a pre-built menu from another project (Rafael). Current menu is a placeholder with real destinations — labels/targets are a one-line change.
5. **"Get Support" / "MyLP".** "MyLP" only appears as placeholder copy in a seed FAQ answer — it is not a real feature. Decide whether the concept exists. "Get Support" placement (homepage tile vs. menu) is a design call.
6. **Services data hygiene.** The seed list has a duplicated "Legal assistance" and placeholder names ("Essential Support"). Confirm the real public category list with Ana.
