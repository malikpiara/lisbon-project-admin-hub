# Documentation index

Everything in `docs/`, grouped by why you'd reach for it. New here? Read
**ARCHITECTURE** then **ADMIN-HANDOVER** first — the rest is reference.

## Start here

| Doc | What it covers |
| --- | --- |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Data flow (one shared localStorage store still feeds the public site), the non-standard radius scale, `cn()`/tailwind-merge, how `tone` works, the token system, and the running list of known inconsistencies + the pre-release checklist. **Read before touching data flow or the design system.** |
| [ADMIN-HANDOVER.md](./ADMIN-HANDOVER.md) | The Payload-backed custom admin at `/admin` — the headless pattern (server reads via Local API, writes via gated server actions), what's built, and what's left to retire `/cms-admin`. |

## Audits (2026-07-05)

| Doc | What it covers |
| --- | --- |
| [SEO-AUDIT.md](./SEO-AUDIT.md) | The SEO baseline added (metadata, canonicals, structured data, sitemap, robots, manifest, OG image, `/services` hub) + the one high-impact issue left for a bigger task (public pages render client-side). |
| [AI-DISCOVERABILITY.md](./AI-DISCOVERABILITY.md) | Getting cited by AI answer engines: `/llms.txt`, the entity graph, AI-crawler access, and the content/presence work that's the real lever. |
| [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) | Auth/RBAC/secrets/XSS/injection review (all sound), the PII-redaction fix, the security headers added, and open items (dependency vulns, CSP, HSTS). |

## Decisions & evaluations

| Doc | What it covers |
| --- | --- |
| [CMS-EVALUATION.md](./CMS-EVALUATION.md) | The Payload vs Sanity vs custom-Supabase bake-off and the decision (Payload on Supabase Postgres, 2026-06-23). |
| [payload-admin-teardown.md](./payload-admin-teardown.md) | Teardown of Payload's default admin that motivated building the custom `/admin` UI. |
| [content-model-review.md](./content-model-review.md) | The content-model mapping. |
| [PROTOTYPE-HANDOVER.md](./PROTOTYPE-HANDOVER.md) | Superseded early prototype/Sanity-spike handover (kept for history). |

## Analytics & content

| Doc | What it covers |
| --- | --- |
| [ANALYTICS.md](./ANALYTICS.md) | PostHog instrumentation, the chatbot-logging Zap, and the Insights dashboard data sources. |
| [CONTENT-MIGRATION-AUDIT.md](./CONTENT-MIGRATION-AUDIT.md) | Audit of the old MailerLite-built site's content for the rebuild. |
