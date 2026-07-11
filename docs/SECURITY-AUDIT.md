# Security audit

_Audited 2026-07-05. Scope: application code + source (auth, server actions,
public endpoints, PII handling, secrets, XSS/injection surface, headers,
dependencies)._

_Re-verified 2026-07-11: all four open items below are still open (no
`pnpm.overrides`/`undici` pin; CSP still report-only; privacy-contact TODO
unchanged; HSTS to confirm on Vercel)._

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

## Method

Manual review (auth gate, actions, collection access, webhook, secrets, injection
paths) + greps for `dangerouslySetInnerHTML`/`eval`/hardcoded secrets +
`pnpm audit`. Header changes verified live (`HEAD /` returns them).
