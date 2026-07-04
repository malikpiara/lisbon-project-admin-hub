# Content-migration audit — old AdminHub (MailerLite) vs new app

**Date:** 2026-07-04 (v2 — full-site census) · **Status:** analysis for review, no changes made
**Old site:** https://lpinformation.mailerpage.io (MailerLite-built)
**Compared against:** Payload collections (`payload/collections/`), the admin
editor forms (`app/(frontend)/admin/`), and the public renderers
(`components/services/`, `components/site/`).

**Coverage:** every reachable page — 13 category hubs + home +
**62 content pages** (full census in §8), including third-level pages found by
crawling. 2 linked pages are dead (404); 1 nav item has no page at all.

**Note:** all content currently in the new app is placeholder — nothing has
been copied from the old site yet. Every page in §8 is still to migrate.

**Decisions (2026-07-04):**
- ✅ **Key Links render at the top of the article** (matches old hierarchy;
  implemented in ArticleView/preview/editor/schema).
- ✅ **Decorative section-header images are dropped** by design.
- ✅ **Localisation is deferred** — not part of the first release. Migration
  caution stands: don't silently discard PT title halves during manual entry;
  keep them somewhere recoverable (e.g. the migration sheet).

---

## 1. What the old site actually is

Three page shapes, plus site-wide furniture:

1. **Category hubs** (13): a heading and a list of topic links. Some entries
   link externally (IAC, Google Drive, kitmigrante.pt, YouTube), one has no
   page ("Children with Special Needs"), one is a placeholder ("COMING SOON —
   Family Subsidies").
2. **Article pages** (~55): a consistent template — *Key Links → What is it? →
   Why/Who can apply? → Step-by-step guide → Documents required → FAQ →
   Community Tips & Learning* — with recurring optional groups: **Key
   Contacts**, **Key Locations**, **Scams to be careful of**, **News to be
   aware of**, **Workshop recordings**, and a "Send Tip / Suggestion" form.
3. **Resource/lookup pages**: PDF download cards (External Resources),
   emergency-number tables, org directories with full contact details, and
   **3 screenshot-tutorial guides** (7–13 instructional images each).

Site-wide: footer with physical address, WhatsApp, Facebook, Instagram,
LinkedIn, Vimeo; homepage satisfaction survey; Register/Donate CTAs.

**The good news:** the new article schema (`Topics.article`) matches the
template's *shape* almost 1:1 (heroLead, sections, keyLinks, faqs). The gaps
are inside the fields, in the recurring optional groups, and in the page
types that aren't articles.

---

## 2. Gaps that block a faithful migration (P0)

### 2.1 Inline links in body text — pervasive, confirmed site-wide

Not an edge case: **roughly 9 in 10 articles** embed links mid-prose —
government portals (ePortugal, Portal das Finanças, seg-social.pt, AIMA),
booking systems (SIGA), legal texts (Diário da República), cross-links to
other articles. FAQ answers link too.

New `body`, `lead`, and FAQ `answer` are **plain textareas** — no way to hold
a link inside a sentence. Migrators would strip links into the Key Links
list, losing the "which step does this belong to" context — at the scale of
~55 articles, that's a systematic quality loss, not an annoyance.

**Suggestion:** swap `body` (and FAQ `answer`) to Payload's Lexical rich text
(`@payloadcms/richtext-lexical` is already installed and set as the editor).
Restrict the toolbar: links, bold, lists, headings (headings also solve 2.3),
tables (solves 2.4). Costs: the two renderers (public `ArticleView`, admin
`ArticlePreview`) and the editor field. *Cheaper interim:* a markdown-lite
`[text](url)` convention parsed at render — ~30 lines, keeps textareas — but
it doesn't solve sub-headings, tables, or images, which the census shows are
also real. Rich text pays for four gaps at once.

### 2.2 Files, PDFs, and content images — no media story

- PDFs hosted on **MailerLite storage** (`mlcdn.com`,
  `mailerlite-uploads-prod`) die with the account: toilets/showers guide,
  STI-testing guide, nationality-reform infographic, plus Google Drive decks.
  (Government-hosted PDFs — AIMA modelo-1, MOD PJ 1/2, DGES guides — can stay
  external.)
- **3 Finanças guides are screenshot tutorials** (7–13 instructional images):
  register at the Finanças portal, authenticate on the tax portal, submit IRS
  Automático. The new article model has **no image support at all** — these
  pages currently cannot be migrated, period.

**Suggestion:** add a `Media` upload collection (Payload native; Supabase
Storage or repo `public/` for the ~10 orphaned files), and an image slot in
article content — either an `image` field per section or images inside rich
text (again: Lexical). Migration prep: download every mlcdn/Drive asset
before the MailerLite account winds down.

### 2.3 Sub-headings inside sections — common, not rare

v1 of this audit thought `/transportation-passes` (six pass types as H3s) was
the worst case. The census found the pattern on at least **8 more pages**:
qualification recognition (3 recognition types), non-emergency housing (4
programs, each with eligibility/how-to-apply), nationality (7 document
sub-groups), asylum (2 CNAR stages), FGM (5 step groups), formal letters
(6 step groups), culture shock (5 strategies), Plan of Action for Migrations
(4 pillars). Splitting each into top-level sections would fragment articles
into 8–12 alternating panels.

**Suggestion:** headings inside rich text (2.1) solve this for free. If rich
text is deferred, a repeatable `subsections` array is the fallback.

### 2.4 Contacts — the model is too thin, and they attach to the wrong thing

The census shows structured contact data is **the single most common
"doesn't fit" item** (~15 pages). The real data has:

- **Addresses** (org offices, 5 library branches, 5 Câmara desks, AIMA office)
- **Operating hours** ("weekdays 9:00–18:00", "Wed/Fri 10am–5pm", per-location)
- **Multiple phones/emails** per org (CPR 2+2; AIMA 3 emails; SS has separate
  general + booking lines)
- **Websites**, **WhatsApp numbers**, **person names** (lawyers; Carmel
  Sharkey, Healthcare Advocate on the Healthcare hub)
- Extremes: temporary housing lists **9 facilities with bed capacity**;
  Ajuda de Mãe has **5 locations each with own hours/phones/emails**

Two problems with the new model:
1. `contacts {organization, service, phone, email, category}` can't hold
   address/hours/website/notes.
2. Contacts live **on the Service**, but the old site attaches them
   **per-article** ("Key Contacts" / "Key Locations" groups) — the NISS
   article's Segurança Social numbers belong to that article, not to a
   service-wide list.

**Suggestion:** (a) extend the contact shape with optional `address`,
`hours`, `website`, `notes`; relabel `organization` → "Name / organisation";
(b) add a per-topic `keyContacts` array (same shape) rendered as a
"Key contacts" block, sibling of the new Key Links section. Covers "Key
Locations" too (a location is a contact with an address and hours).

---

## 3. Content with no home in the new IA (P0 for planning)

Only **1 of 13 categories** exists in the new app (`family-child-support`).
Volume by old category (unique content pages): Finanças 10, Family 8, Civic
Offices 8, Immigration 8, Healthcare 6, Housing 5, External Support 6,
Social Security 3, Education 3, Transportation 3, Well-Being 2, External
Resources 1 (+2 PDFs), Emergency Contacts (table page).

Page types that still lack a collection/surface:

| Old page type | Example | Nearest new home | What's missing |
|---|---|---|---|
| Emergency numbers table | `/emergency-contacts` (112, 144, …) | `contacts`, category "Emergency" | A surface to show them; number+purpose fits after §2.4 |
| PDF download cards | `/external-resources` | Quick Access (`href`+`external` ✓) | Media hosting (2.2) |
| Org directory + guides | `/external-support` | contacts (after §2.4) + topics | Topic grouping (3.1) |
| Screenshot tutorials | 3 Finanças guides | — | Image support (2.2) |

### 3.1 Hubs contain external links, groupings, and gaps

- **External entries:** Family hub → IAC website + Google Drive deck;
  Healthcare hub → kitmigrante.pt; Immigration hub → YouTube explainer +
  PNG infographic; External Support → Padlet mapping + safecommunities.
  The new `topics` can only be internal articles. Two of the ten
  already-created family topics (`instituto-apoio-crianca`,
  `parenting-tips`) have **no article content to migrate** — they were
  pointers.
- **Groupings:** External Support clusters links under 3 sub-headings.
- **Gaps to not re-create:** `children-special-needs` had no page on the old
  site (the new topic is an invention — needs content written, not
  migrated); Assisted Voluntary Return links to a **404**; Social Security
  hub has a "COMING SOON" placeholder.

**Suggestion:** optional `externalHref` on topics (card links out, no article
page) and optional `group` text for hub sub-headings. Both additive.

---

## 4. Workflow and editorial gaps (P1 — but cheap and high-trust)

### 4.1 Legal review is a three-state workflow, not a flag

The census found **two distinct flagged states** on live pages:
- 🔴 "This post has **not yet been checked** by our partner lawyers" — 13 pages
  (basic-education, childcare, CTT, NIF, qualifications, free-childcare,
  family-subsidies, family-mediation, utente-number, NISS, migration-plan,
  trafficking, labour-mediation)
- 🟠 "This post is **in process of being checked** by our partner lawyers" —
  2 pages (manifestation-of-interest, permanent-residence-permit)

So ~25% of articles carry a review state, publicly. **Suggestion:**
`reviewStatus` select on topics — `notReviewed / inReview / reviewed` —
rendered as a notice banner on the public article for the first two states.
The audit fields already capture who/when; this captures the *editorial*
state. It's also a natural handoff control for the team.

### 4.2 Time-dated alerts are real content

Manifestation of Interest carries "**MAJOR CHANGES ANNOUNCED 03/06/2024** —
process no longer accepts new requests" as an in-page alert. The recurring
"⚠️ Scams / 🗞️ News" groups hold similar time-sensitive notices (SMS-fraud
warnings on NISS, portal-scam warnings on Finanças pages); many are empty
placeholders, some are live.

**Suggestion:** an optional `notice` group on topics — `{ tone: info|warning,
date, text }` — rendered as an Infobox at the top of the article. Fits the
release goal (push, not pull) better than burying alerts in a section. The
empty Scams/News placeholders should *not* be migrated as empty sections.

### 4.3 Reader feedback loop

Every article ends with "Send Tip / Suggestion"; the homepage runs a
satisfaction survey. New app has analytics but no submission channel. Old
tips were the mechanism for the scams/news updates above. **Suggestion:**
PostHog survey on article pages first (no schema, measurable), Supabase
`tips` table as fallback. Validate before building more.

### 4.4 Bilingual content

Titles are EN/PT on most articles; the 3 screenshot guides have full PT
heading translations; Ajuda de Mãe links a **Nepalese** version. New schema
is single-locale. **Decided: localisation is deferred — v1 is EN-only.**
Remaining caution: PT title halves and the Nepalese Ajuda de Mãe version
should be preserved in the migration sheet, not silently discarded.

---

## 5. Smaller deltas to confirm as deliberate (P2)

- ~~**Key Links placement**~~ — decided: top of the article (done).
- **Workshop recordings:** 4+ pages have a "Workshop recordings" group tied
  to the Vimeo channel; some reference recordings without links. Fine as
  keyLinks entries, but ask the team whether recordings are a first-class
  need.
- **Footer:** new social links are `href="#"` placeholders; old site also has
  **WhatsApp** (a live support channel for this audience), Vimeo, and the
  **physical address**. Feels like content loss, not redesign.
- ~~**Section images**~~ — decided: decorative section-header images are
  dropped. (Distinct from *instructional* images, §2.2 — still open.)
- **Heading vocabulary varies** ("Who can apply?", "What programs do they
  have?", "How it works") — headings are free text, no schema impact; don't
  hard-code the template during migration.
- **Editorial recommendations** (3 named driving schools, retail lists on the
  Dodot page) — plain content, fits bullets; just flag for the team's
  editorial policy.
- **Register/Get-Support CTA** — covered by Quick Access defaults ✓.

---

## 6. Suggested change list, prioritised

| # | Change | Where | Effort | When |
|---|---|---|---|---|
| 1 | Rich text for `body` + FAQ `answer` (links, headings, tables, images) | Topics schema + editor + 2 renderers | M–L | Before content entry starts |
| 2 | `Media` collection + re-host ~10 orphaned files | payload.config + new collection | S–M | Before old site shuts down |
| 3 | Contacts: `address`/`hours`/`website`/`notes`; per-topic `keyContacts` | Services+Topics schema, renderers, editor | M | Before content entry starts |
| 4 | `reviewStatus` (3-state) + public notice banner | Topics + article view + editor | S | v1 — 15 pages carry it today |
| 5 | `notice` alert group (tone/date/text) on topics | Topics + article view + editor | S | v1 — serves push-insights goal |
| 6 | `externalHref` on topics | Topics + topics grid | S | Before migrating hubs |
| 7 | Topic `group` for hub sub-headings | Topics + service page | S | When External Support migrates |
| 8 | Footer: real social URLs + WhatsApp + address | site-footer.jsx | XS | Any time |
| 9 | Feedback channel (PostHog survey first) | No schema | S | Post-v1 experiment |
| 10 | Localization decision (EN-only vs EN/PT titles) | Decision | — | Before manual entry |

Items 1–3 get **harder after migration starts** (content typed flat or
pointing at dying URLs must be re-touched). Everything else is additive.
If only one lands before entry begins, make it #1 — it also absorbs the
sub-heading (2.3) and table problems, and most of the image problem.

---

## 7. Where tables actually occur (for the rich-text scoping)

Marriage registration costs (€120/€200) · Social Integration Income
thresholds (€242.23 / 100-70-50%) · driver's-license bilateral-country
rules · PT↔EN phrase tables (formal letters) · legal-support org table
(orgs × support × contacts — better served by keyContacts, §2.4) ·
emergency-numbers table (number × service × purpose).

---

## 8. Full page census (migration checklist)

Legend: 🔴 not lawyer-reviewed · 🟠 review in progress · ★ special handling
needed. Old slugs are unreliable (`/transportation-copy` = Housing hub;
`/tax-numer-nif-copy` = a *healthcare* guide) — **map by title, not slug**.

### Family — hub `/children`
| Old path | Title | Flags |
|---|---|---|
| /basic-education | Basic Education | 🔴 inline links |
| /childcare | Childcare (Creches) | 🔴 Key Locations |
| /free-childcare | Free Childcare (Creches Gratuitas) | 🔴 |
| /family-reunification | Family Reunification | ★ AIMA form download, Art. 98 checklists |
| /family-subsidies | Family Subsidies | 🔴 ★ several sections "TBA" |
| /ajudademae | Associação Ajuda de Mãe | ★ 5 locations w/ hours; Nepalese version |
| /family-mediation | Family Mediation | 🔴 costs/duration |
| /-copy-copy-copy-copy | Dodot App setup | app-store links, retail list |
| — (no URL) | Children with Special Needs | ★ page never existed — write, don't migrate |
| external | IAC · Parenting deck (Drive) | ★ needs externalHref / Media |

### Civic Offices — hub `/civic-offices`
| Old path | Title | Flags |
|---|---|---|
| /menu-junta-da-freguesia | Junta da Freguesia | thin menu page |
| /camara-municipal | Câmara Municipal services | 5 desk locations |
| /ctt | Postal Service CTT | 🔴 |
| /camara-municipal-copy-copy-copy | Register a Newborn at IRN | 20-day window notice |
| /irn-how-to-register-a-marriage | Register a Marriage (IRN) | cost table |
| /loja-de-cidadao | Loja de Cidadão | multi-helpline w/ hours |
| /public-library | Public Libraries in Lisbon | 5 branch addresses |
| /camara-municipal-copy | Registering to Vote | eligibility by nationality |

### Education — hub `/education` (also links Basic Education, Childcare)
| Old path | Title | Flags |
|---|---|---|
| /conversion-of-qualifications | Conversion of Foreign Qualifications | 🔴 3 H3 types, DGES PDFs |
| /documents-for-primary-and-secondary | Docs for Foreign School Qualifications | form PDF |
| /empty-format-copy-copy-copy-copy-copy-copy | Free School Books | ★ Workshop recordings |

### Finanças — hub `/financas`
| Old path | Title | Flags |
|---|---|---|
| /tax-numer-nif | Tax Number (NIF) | 🔴 2 tax-office addresses |
| /bank-account | Opening a Bank Account | |
| /irs | How to Submit IRS | |
| /mbway | Set up MBWay | scams section live |
| /green-receipts | Green Receipts | scam warning |
| /financas-portal | Navigate the Finanças Portal | links 3 guides ↓ |
| /registration-at-finances-portal-guide | Register at Finances Portal | ★ 7-image tutorial |
| /access-portuguese-tax-portal-for-authentication-guide | Tax-portal authentication | ★ 13-image tutorial |
| /complete-irs-automatico-submission-with-pre-filled-declaration | IRS Automático submission | ★ 13-image tutorial |
| /family-subsidies-copy-copy-copy-copy-copy | Declare Employment Contract | cross-links NIF/NISS |

### Healthcare — hub `/snshealthcare` (+ external kitmigrante.pt; staff contact Carmel Sharkey ★)
| Old path | Title | Flags |
|---|---|---|
| /utente-number | Obtaining an Utente Number | 🔴 |
| /health-center | Health Center | |
| /health-center-copy | European Health Card | |
| /health-center-copy-copy | Healthcare Insurance | provider list |
| /hospital-services | University Healthcare Clinics | |
| /tax-numer-nif-copy | Appointment at a Healthcare Center | ★ slug lies — healthcare content |

### Immigration — hub `/immigration` (+ YouTube explainer ★, infographic PNG ★)
| Old path | Title | Flags |
|---|---|---|
| /manifestation-of-interest | Manifestation of Interest | 🟠 ★ dated closure alert 03/06/2024 |
| /p-residencepermit | Permanent Residence Permit | 🟠 AIMA form PDF |
| /rv-documents | Art. 80 Required Documents | checklist page |
| /documents-article-88-mf | Art. 88 n.2 Required Documents | 2 AIMA form PDFs |
| /asylumapplicationprocess-copy | Asylum Application Process | CPR full contact |
| /health-center-copy-copy-copy | Requesting Portuguese Nationality | 7 doc sub-groups, form PDFs |
| /aimacopycopy-copy | Appointment at AIMA | 3 AIMA emails |
| /schengeninformationsystem | SIS Alert while applying | |
| /empty-format-copy-copy | Plan of Action for Migrations 2024 | 🔴 4 H3 pillars |
| /empty-format-copy-copy-copy-copy | Assisted Voluntary Return | ★ **404 — dead link** |

### Social Security — hub `/socialsecurity` (+ "COMING SOON — Family Subsidies" ★)
| Old path | Title | Flags |
|---|---|---|
| /niss | Social Security Number (NISS) | 🔴 SMS-fraud scam alert |
| /social-integration-income | Social Integration Income | ★ Key Contacts/Locations groups, threshold table |
| /iefp-registration | IEFP Registration | services table |

### Transportation — hub `/transportation`
| Old path | Title | Flags |
|---|---|---|
| /transportation-passes | Public Transportation Passes | ★ 6 pass-type H3s — worst nesting case |
| /drivers-license | Converting your Driver's License | country-rules table |
| /niss-copy-copy | Obtain a Driver's License | 3 named driving schools |

### Housing — hub `/transportation-copy` (slug lies)
| Old path | Title | Flags |
|---|---|---|
| /emergency-house-support | Emergency House Support | ★ 6-org directory, referral form, Workshop recordings |
| /non-emergency-housing | Non-emergency Housing Programs | 4 program H3 groups |
| /family-subsidies-copy-copy | Affordable Housing & Housing Rights | portal/agent link lists |
| /family-subsidies-copy | Porta 65-Jovem | |
| /emergency-house-support-copy-copy | Temporary Housing | ★ 9 facilities w/ capacity |

### External Support — hub `/external-support` (+ Padlet embed ★, safecommunities link)
| Old path | Title | Flags |
|---|---|---|
| /protecaojuridica | Proteção Jurídica (legal aid) | MOD PJ 1/2 forms |
| /labour-mediatio | Labour Mediation | 🔴 (typo'd slug, live page) |
| /trafficking-and-exploitation | Trafficking & Exploitation Support | 🔴 hotline directory |
| /family-subsidies-copy-copy-copy-copy | Harmful Traditional Practices (FGM) | ★ 6-org contact directory |
| /emergency-house-support-copy | Domestic Violence Support | ★ 5-org directory, Workshop recordings |

### Well-Being — hub `/well-being-resources`
| Old path | Title | Flags |
|---|---|---|
| /managing-stress | Understanding & Managing Stress | hotlines, infographics |
| /culture-shock | Culture Shock & Homesickness | ★ Padlet iframe |

### External Resources — hub `/external-resources`
| Old path | Title | Flags |
|---|---|---|
| /how-to-write-a-formal-letter | Letters & Emails in Portuguese | ★ PT↔EN phrase tables |
| (2 PDF cards) | Toilets/Laundry/Showers · Free STI Testing | ★ mlcdn-hosted PDFs — re-host |

### Emergency Contacts — hub `/emergency-contacts`
Numbers table: 112, 144, 800 242 424, 116 111, 116 000 (number · service ·
purpose). Also links safecommunitiesportugal.com.

---

## 9. Open questions for the team

1. Legal review: still the workflow? Who flips 🔴→🟠→reviewed? (drives #4)
2. Do all 13 categories become Services, or do External Resources /
   Emergency Contacts / Well-Being get a different surface?
3. Was "Send Tip / Suggestion" ever used? (decides #9)
4. Are workshop recordings (Vimeo) a first-class content need?
5. Long-term home for the ~10 orphaned files (Supabase Storage vs `public/`)?
6. The 3 screenshot tutorials: migrate as image sequences, or rewrite as
   text steps? (decides how much of #1/#2 they need)

Answered 2026-07-04: Key Links at top ✅ · decorative images dropped ✅ ·
localisation deferred (EN-only v1) ✅.
