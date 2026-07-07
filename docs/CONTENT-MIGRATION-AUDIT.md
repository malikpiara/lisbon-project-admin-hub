# Moving the AdminHub content to the new app — what fits, what doesn't, and what we need to decide

**Last updated:** 2026-07-07 · prepared by Malik for the Lisbon Project design team
**Old site:** https://lpinformation.mailerpage.io (built in MailerLite)
**New app:** https://lp.lisboaux.com (work in progress)

## What this document is

We reviewed **every page of the old AdminHub site** — 13 category pages, the
home page, and 62 information pages — and compared what's on them against
what the new app can currently store and display.

The goal: when the team starts copying content over by hand, nothing
important should get lost because the new app "has no box to put it in."
This document lists where those missing boxes are, what we propose to do
about each one, and the handful of decisions we need from you.

**Important context:** everything currently visible on the new app is
placeholder text. Nothing has been migrated yet — the full page-by-page
checklist is at the end of this document.

---

## 1. Where things stand today

The old site's information pages follow a very consistent recipe:

> Key Links → What is it? → Why would I need it? → Step-by-step guide →
> Documents required → FAQ → Community Tips & Learning

The new app was designed around that same recipe, so the overall shape
carries over well. Compare for yourself:

- Old: [Basic Education](https://lpinformation.mailerpage.io/basic-education)
- New: [Basic Education](https://lp.lisboaux.com/services/family-child-support/basic-education) *(placeholder text, real structure)*

What already works in the new app:

- **Articles** with a title, intro line, and any number of titled sections
  (paragraphs, bullet or numbered lists, an optional button)
- **Key Links** — the shortcut list at the top of each article
  ([see it live](https://lp.lisboaux.com/services/family-child-support/basic-education),
  or in the [component gallery](https://lp.lisboaux.com/components/key-links))
- **FAQs** as an expandable list at the end of each article
- **Contacts tables** with search and category filters on each category page
- **Quick Access** shortcut cards on the [home page](https://lp.lisboaux.com)
- An **editing area** for the team (login required) where every article is
  edited next to a live preview of the page — no more blind form fields
- **Team accounts** you manage yourselves: adding someone creates an invite
  link to send them (WhatsApp/email); they choose their own password and are
  in. No passwords ever need to be shared.
- **A safety net for edits:** every save is recorded, and there are two
  roles — *admins* publish directly, *editors'* changes wait in a Review
  queue where an admin sees exactly what words changed (before/after,
  side by side) and approves or declines. Nothing is ever lost either way.

### Decisions already made

| Decision | Status |
|---|---|
| Key Links sit at the **top** of articles, same as the old site | ✅ Done, live |
| The decorative images above each section heading are **dropped** in the new design | ✅ Confirmed |
| Other languages (Portuguese, Nepalese) are **postponed** — the first release is English-only | ✅ Confirmed — but see the note in Gap 6 about not losing the Portuguese titles |

---

## 2. The gaps — six things the old content does that the new app can't hold yet

For each: what it is, a real page where you can see it, and what we propose.
None of these are built yet; they're listed in the order we'd tackle them.

### Gap 1 — Links inside sentences (the big one)

On the old site, almost every article has links *woven into the text*:
"register at the **Portal das Matrículas**", "check the **fee simulator**",
and so on. See the step-by-step guide on
[Basic Education](https://lpinformation.mailerpage.io/basic-education) —
the links live inside the instructions, exactly where you need them.

The new app's text fields are currently **plain text only** — a link cannot
live inside a sentence. If we migrated today, every one of those links would
have to be pulled out of its sentence and parked in the Key Links list,
losing the "click here *at this step*" context. Roughly 9 out of 10 old
articles have this.

**Proposal:** upgrade the article text editor so the team can make words
into links (and add small headings and simple tables — see Gaps 2 and 3,
which this also solves). This should happen **before** anyone starts copying
content, otherwise all of it has to be touched twice.

### Gap 2 — PDFs, downloads, and step-by-step screenshots

Two related problems:

1. Some old pages offer **PDF downloads** hosted on MailerLite's servers —
   e.g. the guides on
   [External Resources](https://lpinformation.mailerpage.io/external-resources).
   When the MailerLite account is closed, **those files disappear**. The new
   app currently has no place to upload and host files.
2. Three Finanças guides are **screenshot walkthroughs** — 7 to 13 annotated
   screenshots each, like
   [How to register at the Finanças portal](https://lpinformation.mailerpage.io/registration-at-finances-portal-guide).
   The new app's articles can't show images at all yet, so these pages
   currently **cannot be migrated in any form**.

**Proposal:** add file/image upload to the app, and download all ~10
affected files from MailerLite *before* the account winds down. For the
three screenshot guides, a decision from you: keep them as image
walkthroughs, or rewrite them as written steps? (Question 6 below.)

### Gap 3 — Contact details are richer than the new app's contact card

The new app's contact entries hold: organisation, description, phone, email.
The old site's real contact information is much richer:

- [Ajuda de Mãe](https://lpinformation.mailerpage.io/ajudademae) lists **5
  locations, each with its own address, phone numbers, emails and weekly
  opening hours**
- [Temporary Housing](https://lpinformation.mailerpage.io/emergency-house-support-copy-copy)
  lists **9 shelters with addresses and bed capacity**
- [External Support](https://lpinformation.mailerpage.io/external-support)
  lists organisations *and individual lawyers* with street addresses
- Many pages have "Key Contacts" / "Key Locations" boxes tied to that
  specific article (e.g.
  [Social Integration Income](https://lpinformation.mailerpage.io/social-integration-income))

**Proposal:** extend contact entries with address, opening hours, website
and a notes line — and let individual articles carry their own short
"Key contacts" list (like Key Links, but for people/places). This is the
second thing that should land before content entry starts.

### Gap 4 — The "checked by our lawyers" flag

The old site openly tells readers where a page stands in legal review:

- 🔴 *"This post has **not yet been checked** by our partner lawyers"* — on
  13 pages, e.g. [Childcare](https://lpinformation.mailerpage.io/childcare)
- 🟠 *"This post is **in process of being checked** by our partner lawyers"* —
  on 2 pages, e.g.
  [Manifestation of Interest](https://lpinformation.mailerpage.io/manifestation-of-interest)

That's a real editorial workflow — about a quarter of all articles carry one
of these flags today. The new app has no way to record or display review
status.

**Proposal:** give every article a review status (*not reviewed → being
reviewed → reviewed*) that the team sets in the editing area, shown as a
notice on the public page for the first two states. Cheap to build, and it
keeps the honesty the old site had. Needs your confirmation that legal
review is still how the team works (Question 1).

> **Update (7 July):** the app now has an editorial approval workflow —
> editors' changes wait for an admin to approve them, with a side-by-side
> comparison of what changed. That's *editorial* review (who may publish);
> the lawyer flag above is a separate, *public-facing* label and still needs
> the small status field proposed here. The two compose nicely: "approved by
> an admin" and "checked by lawyers" answer different questions.

### Gap 5 — Urgent notices on articles

The old
[Manifestation of Interest](https://lpinformation.mailerpage.io/manifestation-of-interest)
page carries a dated warning: *"MAJOR CHANGES ANNOUNCED 03/06/2024 — this
process no longer accepts new requests."* Several pages have similar
"Scams to be careful of" warnings (e.g. fake-SMS alerts on
[NISS](https://lpinformation.mailerpage.io/niss)).

The new app has no way to put a dated warning banner on an article.

**Proposal:** an optional notice per article (info or warning, with a date)
shown in a highlighted box at the top. This fits the project goal of
*pushing* important information to people rather than hoping they find it.

### Gap 6 — Category pages that point outside the app

On the old site, category pages mix three kinds of entries:

- normal links to their own articles ✓ (the new app does this)
- links **straight to external resources** — e.g. on
  [Family](https://lpinformation.mailerpage.io/children), "IAC Support"
  goes to an external website and "Parenting with Love" opens a Google
  Drive presentation
- links to a **video** ([Immigration](https://lpinformation.mailerpage.io/immigration)
  links a YouTube explainer) or an embedded resource board
  ([External Support](https://lpinformation.mailerpage.io/external-support)
  embeds a Padlet)

In the new app, every card on a category page must be an internal article.
Two of the ten Family cards already created in the new app
(*Instituto de Apoio à Criança*, *Parenting tips*) actually **have no
article content behind them on the old site** — they were pointers to
external material.

**Proposal:** allow a card to link directly to an external resource, and
allow small group headings on a category page (External Support groups its
links under "Legal Support", "Mapping of External Services", "Specialist
Care Needs").

*Related note on languages:* while copying content, the Portuguese halves of
titles (e.g. "EDUCAÇÃO BASICA") and the Nepalese version of Ajuda de Mãe
should be kept in the migration spreadsheet — not typed into the new app,
but not thrown away either, so nothing is lost if languages return later.

---

## 3. Smaller things worth knowing

- **The footer lost some contact routes.** The old site's footer has
  WhatsApp (a real support channel for this community), the Vimeo channel,
  and the physical address. The new footer currently shows only
  Facebook/Instagram/LinkedIn placeholders. Easy fix once you confirm what
  should be there.
- **"Send Tip / Suggestion".** Every old article ends with a small feedback
  form, and the old home page runs a satisfaction survey. The new app
  measures usage anonymously but has no way for readers to *tell* the team
  something (that's how scam warnings used to arrive). We'd like to know if
  those forms ever got real use before rebuilding them (Question 3).
- **Workshop recordings.** Several pages (e.g.
  [Emergency House Support](https://lpinformation.mailerpage.io/emergency-house-support))
  have a "Workshop recordings" section tied to the
  [Vimeo channel](https://vimeo.com/user89217165). These can live in Key
  Links, unless recordings deserve their own home (Question 4).
- **Housekeeping found during the review:** the old "Assisted Voluntary
  Return" link is broken (goes to a 404); "Children with Special Needs" on
  the Family page never had a page at all — so that article needs to be
  *written*, not copied; Social Security still shows a "COMING SOON — Family
  Subsidies" placeholder.
- **Old web addresses are misleading** — the Housing page lives at an
  address that says "transportation-copy", and a healthcare guide lives at
  an address that says "tax-number". When building the migration
  spreadsheet, **go by page titles, never by the web address**.

---

## 4. Questions for you

1. **Legal review:** is the lawyer-review workflow still active? Who should
   set an article's status to "reviewed"?
2. **The 13 categories:** should all of them become category pages in the
   new app, or do some (External Resources, Emergency Contacts, Well-Being)
   deserve a different presentation? Emergency numbers, for instance, might
   belong somewhere more prominent than a buried page.
3. **Reader feedback:** did "Send Tip / Suggestion" or the home-page survey
   ever get meaningful responses? (This decides whether we rebuild them.)
4. **Workshop recordings:** are they an important content type, or is a
   link to Vimeo inside Key Links enough?
5. **Files:** is it okay for the ~10 PDFs to be re-hosted inside the new
   app? (The alternative is losing them when MailerLite closes.)
6. **The 3 screenshot guides:** keep as screenshot walkthroughs (needs
   image support), or rewrite as written steps?

---

## 5. Suggested order of work

| Step | What | Why this order |
|---|---|---|
| 1 | Text editor upgrade: links in sentences, small headings, simple tables (Gap 1) | Content copied before this exists has to be redone |
| 2 | File & image uploads; rescue the MailerLite files (Gap 2) | Files vanish when the old account closes |
| 3 | Richer contacts + per-article Key Contacts (Gap 3) | Same "don't type it twice" logic |
| 4 | Review status flag (Gap 4) | Small; needed on day one of content entry |
| 5 | Urgent-notice banner (Gap 5) | Small; supports the "push information" goal |
| 6 | External links + group headings on category pages (Gap 6) | Needed before migrating the category pages |
| 7 | Footer fixes (WhatsApp, address, real social links) | Any time |
| 8 | Reader feedback (pending Question 3) | After launch is fine |

Steps 1–3 are the ones that get more expensive the longer they wait —
everything typed before they exist has to be revisited.

**Before the copy sprint starts:** create the team's accounts (invite links
are ready — see the editing-area notes above) and decide who's *admin* vs
*editor*. Editor saves wait for approval, so for the migration itself either
make the people doing the copying admins, or plan for someone to batch-approve
in the Review queue at the end of each day.

---

## 6. Page-by-page migration checklist

Every reachable page of the old site, grouped by category. Legend:
**🔴** = "not checked by lawyers" flag on the page ·
**🟠** = "review in progress" flag ·
**★** = needs special handling (explained in the notes).

### Family — old hub: [/children](https://lpinformation.mailerpage.io/children) · new: [Family and childcare](https://lp.lisboaux.com/services/family-child-support)
| Old page | Notes |
|---|---|
| [Basic Education](https://lpinformation.mailerpage.io/basic-education) | 🔴 links inside sentences |
| [Childcare (Creches)](https://lpinformation.mailerpage.io/childcare) | 🔴 has a "Key Locations" box |
| [Free Childcare](https://lpinformation.mailerpage.io/free-childcare) | 🔴 |
| [Family Reunification](https://lpinformation.mailerpage.io/family-reunification) | ★ downloadable AIMA form, two document checklists |
| [Family Subsidies](https://lpinformation.mailerpage.io/family-subsidies) | 🔴 ★ several sections were never finished ("TBA") |
| [Ajuda de Mãe](https://lpinformation.mailerpage.io/ajudademae) | ★ 5 locations with hours; Nepalese version exists |
| [Family Mediation](https://lpinformation.mailerpage.io/family-mediation) | 🔴 |
| [Dodot App](https://lpinformation.mailerpage.io/-copy-copy-copy-copy) | app-store links |
| Children with Special Needs | ★ page never existed — needs writing, not copying |
| IAC Support · Parenting presentation | ★ external links only (Gap 6) |

### Civic Offices — old hub: [/civic-offices](https://lpinformation.mailerpage.io/civic-offices)
| Old page | Notes |
|---|---|
| [Junta da Freguesia](https://lpinformation.mailerpage.io/menu-junta-da-freguesia) | thin menu page |
| [Câmara Municipal](https://lpinformation.mailerpage.io/camara-municipal) | 5 office locations |
| [CTT Postal Service](https://lpinformation.mailerpage.io/ctt) | 🔴 |
| [Register a Newborn (IRN)](https://lpinformation.mailerpage.io/camara-municipal-copy-copy-copy) | 20-day deadline warning |
| [Register a Marriage (IRN)](https://lpinformation.mailerpage.io/irn-how-to-register-a-marriage) | small cost table |
| [Loja de Cidadão](https://lpinformation.mailerpage.io/loja-de-cidadao) | several helplines with hours |
| [Public Libraries](https://lpinformation.mailerpage.io/public-library) | 5 branch addresses |
| [Registering to Vote](https://lpinformation.mailerpage.io/camara-municipal-copy) | eligibility varies by nationality |

### Education — old hub: [/education](https://lpinformation.mailerpage.io/education)
| Old page | Notes |
|---|---|
| [Conversion of Foreign Qualifications](https://lpinformation.mailerpage.io/conversion-of-qualifications) | 🔴 3 sub-types under one heading |
| [Documents for School Qualifications](https://lpinformation.mailerpage.io/documents-for-primary-and-secondary) | downloadable form |
| [Free School Books](https://lpinformation.mailerpage.io/empty-format-copy-copy-copy-copy-copy-copy) | ★ Workshop recordings section |
| *(also links Basic Education & Childcare — listed under Family)* | |

### Finanças — old hub: [/financas](https://lpinformation.mailerpage.io/financas)
| Old page | Notes |
|---|---|
| [Tax Number (NIF)](https://lpinformation.mailerpage.io/tax-numer-nif) | 🔴 two tax-office addresses |
| [Opening a Bank Account](https://lpinformation.mailerpage.io/bank-account) | |
| [How to Submit IRS](https://lpinformation.mailerpage.io/irs) | |
| [Set up MBWay](https://lpinformation.mailerpage.io/mbway) | live scam warning |
| [Green Receipts](https://lpinformation.mailerpage.io/green-receipts) | scam warning |
| [Navigate the Finanças Portal](https://lpinformation.mailerpage.io/financas-portal) | links the 3 guides below |
| [Register at the Finances Portal](https://lpinformation.mailerpage.io/registration-at-finances-portal-guide) | ★ screenshot walkthrough (Gap 2) |
| [Tax-portal authentication](https://lpinformation.mailerpage.io/access-portuguese-tax-portal-for-authentication-guide) | ★ screenshot walkthrough (Gap 2) |
| [IRS Automático submission](https://lpinformation.mailerpage.io/complete-irs-automatico-submission-with-pre-filled-declaration) | ★ screenshot walkthrough (Gap 2) |
| [Declare an Employment Contract](https://lpinformation.mailerpage.io/family-subsidies-copy-copy-copy-copy-copy) | |

### Healthcare — old hub: [/snshealthcare](https://lpinformation.mailerpage.io/snshealthcare)
| Old page | Notes |
|---|---|
| [Utente Number](https://lpinformation.mailerpage.io/utente-number) | 🔴 |
| [Health Center](https://lpinformation.mailerpage.io/health-center) | |
| [European Health Card](https://lpinformation.mailerpage.io/health-center-copy) | |
| [Healthcare Insurance](https://lpinformation.mailerpage.io/health-center-copy-copy) | provider list |
| [University Healthcare Clinics](https://lpinformation.mailerpage.io/hospital-services) | |
| [Appointments at a Health Center](https://lpinformation.mailerpage.io/tax-numer-nif-copy) | ★ address says "tax number" — it isn't |
| *(hub also links kitmigrante.pt and names a staff healthcare advocate — Gap 3)* | |

### Immigration — old hub: [/immigration](https://lpinformation.mailerpage.io/immigration)
| Old page | Notes |
|---|---|
| [Manifestation of Interest](https://lpinformation.mailerpage.io/manifestation-of-interest) | 🟠 ★ dated "no longer accepts requests" alert (Gap 5) |
| [Permanent Residence Permit](https://lpinformation.mailerpage.io/p-residencepermit) | 🟠 official form PDF |
| [Art. 80 Documents](https://lpinformation.mailerpage.io/rv-documents) | checklist page |
| [Art. 88 n.2 Documents](https://lpinformation.mailerpage.io/documents-article-88-mf) | two form PDFs |
| [Asylum Application Process](https://lpinformation.mailerpage.io/asylumapplicationprocess-copy) | full CPR contact block |
| [Requesting Portuguese Nationality](https://lpinformation.mailerpage.io/health-center-copy-copy-copy) | 7 document sub-groups |
| [Appointment at AIMA](https://lpinformation.mailerpage.io/aimacopycopy-copy) | several AIMA emails/phones |
| [SIS Alert while applying](https://lpinformation.mailerpage.io/schengeninformationsystem) | |
| [Plan of Action for Migrations 2024](https://lpinformation.mailerpage.io/empty-format-copy-copy) | 🔴 |
| Assisted Voluntary Return | ★ **broken link on the old site (404)** |
| *(hub also links a YouTube explainer and an infographic — Gap 6)* | |

### Social Security — old hub: [/socialsecurity](https://lpinformation.mailerpage.io/socialsecurity)
| Old page | Notes |
|---|---|
| [Social Security Number (NISS)](https://lpinformation.mailerpage.io/niss) | 🔴 SMS-scam warning |
| [Social Integration Income](https://lpinformation.mailerpage.io/social-integration-income) | ★ Key Contacts + Key Locations boxes, income table |
| [IEFP Registration](https://lpinformation.mailerpage.io/iefp-registration) | |
| "Family Subsidies — COMING SOON" | ★ placeholder only |

### Transportation — old hub: [/transportation](https://lpinformation.mailerpage.io/transportation)
| Old page | Notes |
|---|---|
| [Public Transportation Passes](https://lpinformation.mailerpage.io/transportation-passes) | ★ six pass types, each with own heading + document list |
| [Converting a Driver's License](https://lpinformation.mailerpage.io/drivers-license) | country-rules table |
| [Obtaining a Driver's License](https://lpinformation.mailerpage.io/niss-copy-copy) | names 3 driving schools |

### Housing — old hub: [/transportation-copy](https://lpinformation.mailerpage.io/transportation-copy) *(yes, the address says transportation)*
| Old page | Notes |
|---|---|
| [Emergency House Support](https://lpinformation.mailerpage.io/emergency-house-support) | ★ 6-organisation directory, referral form |
| [Non-emergency Housing Programs](https://lpinformation.mailerpage.io/non-emergency-housing) | 4 programs, each with own sub-headings |
| [Affordable Housing & Rights](https://lpinformation.mailerpage.io/family-subsidies-copy-copy) | long link lists |
| [Porta 65-Jovem](https://lpinformation.mailerpage.io/family-subsidies-copy) | |
| [Temporary Housing](https://lpinformation.mailerpage.io/emergency-house-support-copy-copy) | ★ 9 shelters with capacity (Gap 3) |

### External Support — old hub: [/external-support](https://lpinformation.mailerpage.io/external-support)
| Old page | Notes |
|---|---|
| [Proteção Jurídica (legal aid)](https://lpinformation.mailerpage.io/protecaojuridica) | official request forms |
| [Labour Mediation](https://lpinformation.mailerpage.io/labour-mediatio) | 🔴 |
| [Trafficking & Exploitation](https://lpinformation.mailerpage.io/trafficking-and-exploitation) | 🔴 hotline directory |
| [Harmful Traditional Practices](https://lpinformation.mailerpage.io/family-subsidies-copy-copy-copy-copy) | ★ 6-organisation contact directory |
| [Domestic Violence Support](https://lpinformation.mailerpage.io/emergency-house-support-copy) | ★ 5-organisation directory |
| *(hub also embeds a Padlet resource board and groups links under 3 headings — Gap 6)* | |

### Well-Being — old hub: [/well-being-resources](https://lpinformation.mailerpage.io/well-being-resources)
| Old page | Notes |
|---|---|
| [Managing Stress](https://lpinformation.mailerpage.io/managing-stress) | support hotlines |
| [Culture Shock & Homesickness](https://lpinformation.mailerpage.io/culture-shock) | ★ embedded Padlet board |

### External Resources — old hub: [/external-resources](https://lpinformation.mailerpage.io/external-resources)
| Old page | Notes |
|---|---|
| [Letters & Emails in Portuguese](https://lpinformation.mailerpage.io/how-to-write-a-formal-letter) | ★ Portuguese↔English phrase tables |
| Toilets/Laundry/Showers guide · Free STI Testing guide | ★ PDF downloads — rescue before MailerLite closes (Gap 2) |

### Emergency Contacts — old hub: [/emergency-contacts](https://lpinformation.mailerpage.io/emergency-contacts)
A table of five numbers (112 · 144 · 800 242 424 · 116 111 · 116 000) with
what each is for. Where this lives in the new app is Question 2.

---

## Appendix — technical notes (for the dev side)

Plain-language terms above map to: Gap 1 = swap `body`/FAQ `answer`
textareas for Lexical rich text (installed, unconfigured on fields);
Gap 2 = add a Payload `Media` upload collection (Supabase Storage or
`public/`); Gap 3 = extend `contacts` shape + per-topic `keyContacts` array;
Gap 4 = `reviewStatus` select on topics + public banner; Gap 5 = `notice`
group (tone/date/text); Gap 6 = `externalHref` + `group` on topics.
Effort: 1 M–L · 2 S–M · 3 M · 4–6 S each · 7 XS. Payload collection slug
remains `topics` (admin UI says "Articles"); public URLs unaffected.
