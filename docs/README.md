# Documentation index

Everything in `docs/`, grouped by why you'd reach for it. New here? Read
**ARCHITECTURE** then **ADMIN-HANDOVER** first — the rest is reference.

## Start here

| Doc | What it covers |
| --- | --- |
| [RELEASE-CHECKLIST.md](./RELEASE-CHECKLIST.md) | **What stands between today and the team using the platform** — ordered by dependency, with links into the detail docs. The working to-do list for the release. |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Data flow (public site reads Payload server-side — SSG + revalidate), the non-standard radius scale, `cn()`/tailwind-merge, how `tone` works, the token system, and the running list of known inconsistencies + the pre-release checklist. **Read before touching data flow or the design system.** |
| [ADMIN-HANDOVER.md](./ADMIN-HANDOVER.md) | The Payload-backed custom admin at `/admin` — the headless pattern (server reads via Local API, writes via gated server actions), what's built (editors, invites, review/approval queue with word diffs, history), the dev-pushed schema list that needs migrations, and what's left to retire `/cms-admin`. |

## Audits (2026-07-05)

| Doc | What it covers |
| --- | --- |
| [SEO-AUDIT.md](./SEO-AUDIT.md) | The SEO baseline added (metadata, canonicals, structured data, sitemap, robots, manifest, OG image, `/services` hub) + the one high-impact issue left for a bigger task (public pages render client-side). |
| [AI-DISCOVERABILITY.md](./AI-DISCOVERABILITY.md) | Getting cited by AI answer engines: `/llms.txt`, the entity graph, AI-crawler access, and the content/presence work that's the real lever. |
| [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) | Auth/RBAC/secrets/XSS/injection review (all sound), the PII-redaction fix, the security headers added, and open items (dependency vulns, CSP, HSTS). |

## Analytics & content

| Doc | What it covers |
| --- | --- |
| [ANALYTICS.md](./ANALYTICS.md) | PostHog instrumentation, the chatbot-logging Zap, and the Insights dashboard data sources. |
| [CONTENT-MIGRATION-AUDIT.md](./CONTENT-MIGRATION-AUDIT.md) | Audit of the old MailerLite-built site's content for the rebuild: the six content-model gaps, questions for the design team, order of work, and the page-by-page migration checklist. |

## Archive

Concluded decisions and superseded docs live in
[archive/](./archive/README.md) — the CMS bake-off (why Payload on
Supabase), the Payload-admin teardown that motivated the custom UI, the
content-model mapping, and the early prototype handover. Read them for
the *why*, not for how anything works today.
