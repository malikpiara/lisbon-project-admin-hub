import { withPayload } from "@payloadcms/next/withPayload";

// Baseline security headers applied to every response.
//   • Content-Security-Policy ships in REPORT-ONLY mode (below): it reports
//     violations to the browser console without blocking anything, so the
//     allowlist can be tuned against real prod traffic before we switch to
//     enforcing. Flip the header key to "Content-Security-Policy" to enforce
//     once the reports are clean.
//   • No Strict-Transport-Security — the hosting platform sets HSTS; forcing it
//     here risks an HTTP lockout in non-prod. See docs/SECURITY-AUDIT.md.
// X-Frame-Options: SAMEORIGIN blocks click-jacking while still allowing Payload's
// same-origin admin/live-preview framing (CSP frame-ancestors 'self' mirrors it).

// First-pass CSP. Origins come from the site's real integrations: PostHog
// (analytics), the Google Maps embed, and the Zapier chatbot. Fonts are
// self-hosted by next/font, so no external font origin is needed.
// 'unsafe-inline' stays for now (Next's inline bootstrap + Tailwind); tighten to
// nonces/hashes when enforcing. 'unsafe-eval' is intentionally omitted so
// report-only surfaces anything that still needs it.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://*.posthog.com https://*.i.posthog.com https://interfaces.zapier.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.posthog.com https://*.i.posthog.com https://*.zapier.com https://*.supabase.co https://connect.mailerlite.com",
  "frame-src 'self' https://www.google.com https://interfaces.zapier.com https://*.zapier.com https://*.zapier.app",
  "worker-src 'self' blob:",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Content-Security-Policy-Report-Only", value: csp },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Bundle: transform barrel imports (lucide-react is used in 16 files) into
    // direct per-icon imports at build time so unused icons are tree-shaken.
    // (Vercel best practice: bundle-barrel-imports.)
    optimizePackageImports: ["lucide-react", "date-fns"],
    // The app has two root layouts ((frontend) + (payload)), so Next can't
    // compose a normal root not-found for unmatched URLs. globalNotFound lets
    // app/global-not-found.tsx serve the branded 404 app-wide. See the Next 16
    // not-found.js docs (§ global-not-found.js).
    globalNotFound: true,
    // Enables React's native <ViewTransition>. App Router runs on the canary
    // React that Next bundles (which includes ViewTransition) — no react@canary
    // install needed. The admin layout wraps its content pane in one so routes
    // cross-fade; unsupported browsers just swap instantly. Next 16 VT guide.
    viewTransition: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// withPayload injects the @payload-config alias and Payload's build tweaks.
export default withPayload(nextConfig);
