# Security audit

_Audited 2026-07-05. Scope: application code + source (auth, server actions,
public endpoints, PII handling, secrets, XSS/injection surface, headers,
dependencies)._

_Re-verified 2026-07-11: all four open items below are still open (no
`pnpm.overrides`/`undici` pin; CSP still report-only; privacy-contact TODO
unchanged; HSTS to confirm on Vercel)._

## 2026-09-27 — Database: tables exposed through the Supabase Data API (fixed)

**Finding.** Supabase's advisor flagged `rls_disabled_in_public` (critical).
Every one of the 46 Payload tables had Row Level Security off while the Data
API (PostgREST) was running, so anyone holding the project's publishable
(`anon`) key could read, edit and delete them over `/rest/v1`. That includes
`users` (email, password hash + salt, reset token), `users_sessions`,
`subscribers`, `conversation_insights` and `audit_log`. That key is public by
design, but this app never uses or ships it.

**Root cause: dev push kept turning RLS off.** The project has Supabase's
`ensure_rls` event trigger, which enables RLS on each new table. But in
development Payload diffs the live DB against the schema it builds from
`payload.config.ts` and applies the difference (drizzle-kit push). That schema
didn't declare RLS, so drizzle emitted `ALTER TABLE … DISABLE ROW LEVEL
SECURITY` for every table the trigger had protected. `pg_stat_statements`
records 50 of those, run as `postgres`. Because `.env.local` points at prod,
every schema change reopened the hole on the next `pnpm dev`. Enabling RLS in
the dashboard alone would have been undone the same way.

**Fix.**

| Change | Detail | Where |
| --- | --- | --- |
| RLS declared in the schema | An `afterSchemaInit` hook calls `enableRLS()` on every Payload table, so push (and a future `migrate:create`) enables RLS instead of disabling it, including on tables added later. | `payload.config.ts` |
| RLS applied on prod | The 46 `ENABLE ROW LEVEL SECURITY` statements drizzle's own diff produced, run in one transaction on 2026-09-27 12:52 UTC and verified before commit. No policies, so `anon`/`authenticated` are denied everything. | prod DB |
| Regression guard | `pnpm tsx scripts/db-push-dry-run.ts` prints what the next `pnpm dev` would push and exits 1 if it would disable RLS anywhere. | `scripts/db-push-dry-run.ts` |

The app is unaffected. Payload connects as `postgres`, which owns every table
and has `BYPASSRLS`, so RLS never filters its queries.

**Was the data accessed? No evidence of it.** The Data API runs every request
as the `anon`, `authenticated` or `service_role` role. `pg_stat_statements`
has been counting since the project was created (2026-06-23) with zero
evictions (`dealloc = 0`). It holds **no statement ever executed as `anon` or
`authenticated`**. `service_role` ran only Supabase's internal
`storage.buckets` check. No Payload table was touched through the API. The
app has no Supabase client library or key. Conclusion: the tables were
exposed but not exploited, and there is nothing to rotate.

**Verified after the change:** 46/46 public tables have RLS on (fresh
connection); `anon` and `authenticated` read 0 rows on every table and an
unfiltered `UPDATE users` matches 0 rows; the app role's row counts are
unchanged (12,681 rows); Payload's Local API reads normally; the production
`/api/services` returns all 14 docs; the `ensure_rls` trigger still enables RLS
on a new table (probe rolled back). The dev-push diff contains no RLS
statements. Without the hook the same diff lists 46 `DISABLE` statements, which
confirms the hook is what keeps RLS on.

## Summary

The app is well-secured by design: auth is centralised and re-checked at every
layer, the team-management actions enforce role checks explicitly, secrets are
env-only, and the injection/XSS surface is trusted-data only. Two low-risk
improvements were implemented this session (PII redaction on read; baseline
security headers). The main open item is transitive dependency vulnerabilities,
which are **not** low-risk to change and are left as a tracked recommendation.

## Implemented this session

| Fix | Detail | File |
| --- | --- | --- |
| PII redaction on read | Chatbot transcripts were redacted only at capture, so older/edge-case rows reached the team screen with raw email/phone. Now also redacted on read. | `lib/redact-pii.js`, `lib/posthog-insights.js` |
| Security headers | `next.config.mjs` set none. Added `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera/mic/geo/payment/usb off), `X-DNS-Prefetch-Control`. Verified served on every response. | `next.config.mjs` |
| JSON-LD escaping | New structured-data injector escapes `<`/`>`/`&` so a future data-driven graph can't break out of the `<script>`. | `components/seo/json-ld.tsx` |

## Reviewed — already solid (no change needed)

- **Authentication.** `lib/admin-auth.js` (`authedPayload`, wrapped in
  `React.cache`) resolves the Payload session and redirects to `/login` when
  absent. It gates the admin layout, every admin page, **and** every server
  action (server actions are public POST endpoints, so each gates independently).
- **Authorisation (RBAC).** `users/actions.js` re-checks `user.role === "admin"`
  on create/update/delete (password reset allows self), with no-self-delete and
  no-self-demote guards. The `Users` collection also enforces field-level access
  so an editor can't self-promote via the REST/GraphQL API.
- **Brute force.** `Users` uses Payload `auth: true`, which applies Payload's
  default `maxLoginAttempts` / `lockTime` account lockout.
- **Session cookie.** Login sets `payload-token` `httpOnly`, `sameSite: lax`,
  `secure` in production, with an expiry — not readable from JS.
- **Webhook.** `/webhooks/chatbot-log` requires a `Bearer` secret, returns 503
  when unconfigured (never an open logging sink), and caps transcript size.
- **Secrets.** No hardcoded secrets in source; `.env.local` is gitignored. The
  PostHog **personal** key is read only in a server-only module (never imported
  by a client component, so it can't leak into the browser bundle).
- **XSS.** Four `dangerouslySetInnerHTML` uses, all on trusted developer data
  (styleguide code highlighting, shadcn chart CSS, bundled DS icon SVGs, escaped
  JSON-LD) — none render user input.
- **Injection.** HogQL queries interpolate only `Number(...)`-coerced values;
  user-supplied search text is read from event properties, not concatenated into
  query text. Payload's ORM parameterises DB access.

## Open items (recommendations — not applied)

**Not low-risk, so deliberately left for a decision:**

1. **Dependency vulnerabilities.** `pnpm audit` reports ~37 (4 high / 27 moderate
   / 6 low), effectively all **transitive through Payload** (e.g. `undici`
   < 7.28.0 via `@payloadcms/*`). Fixing means `pnpm.overrides` or Payload
   upgrades that could destabilise the DB layer — verify against a real DB before
   applying. Recommended: monitor Payload releases; consider a narrow
   `pnpm.overrides` for `undici` (>=7.28.0) and re-test login + admin CRUD.
2. **Content-Security-Policy.** ✅ Shipped **report-only** 2026-07-08
   (`next.config.mjs`) — reports violations to the console without blocking,
   allowlisting PostHog, the Google Maps embed and the Zapier chatbot (fonts are
   self-hosted by next/font, so no external font origin). `'unsafe-inline'` stays
   for now (Next's inline bootstrap + Tailwind); `'unsafe-eval'` is omitted so
   report-only surfaces anything that needs it. **Next:** review the console
   reports on prod, tighten, then flip the header key to `Content-Security-Policy`
   to enforce (and consider a `report-to` endpoint to collect violations).
3. **HSTS.** Left to the hosting platform (Vercel sets it) to avoid an HTTP
   lockout in non-prod.
4. **Chatbot transcript retention.** Special-category data. Redaction is a floor,
   not a guarantee — set a short PostHog retention window for
   `chatbot_conversation_logged`.
5. **Privacy contact email** is still a TODO placeholder (`privacy/page.js`).
6. **Turn the Supabase Data API off** (dashboard → Integrations → Data API →
   *Enable Data API* off). The app only uses the direct Postgres connection,
   and this is Supabase's own recommendation for that setup. With RLS on it's
   defence in depth: no REST/GraphQL endpoints respond at all, whatever the
   grants or RLS state. It's a dashboard-only setting, so it's not captured in
   code.

## Method

Manual review (auth gate, actions, collection access, webhook, secrets, injection
paths) + greps for `dangerouslySetInnerHTML`/`eval`/hardcoded secrets +
`pnpm audit`. Header changes verified live (`HEAD /` returns them).
