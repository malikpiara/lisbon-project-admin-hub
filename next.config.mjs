import { withPayload } from "@payloadcms/next/withPayload";
import { MARGIN_ORIGIN, marginOn } from "./lib/margin.js";

// Baseline security headers applied to every response.
//   • Content-Security-Policy ships in REPORT-ONLY mode (below): it reports
//     violations to the browser console without blocking anything, so the
//     allowlist can be tuned against real prod traffic before we switch to
//     enforcing. Flip the header key to "Content-Security-Policy" to enforce
//     once the reports are clean.
//   • Strict-Transport-Security only on the Cloudflare build: Vercel sets HSTS
//     itself, Workers sends nothing unless we do (same value Vercel used;
//     public/_headers carries it for static files). Browsers ignore HSTS over
//     plain http, so local dev can't be locked out. See docs/SECURITY-AUDIT.md.
// X-Frame-Options: SAMEORIGIN blocks click-jacking while still allowing Payload's
// same-origin admin/live-preview framing (CSP frame-ancestors 'self' mirrors it).

// First-pass CSP. Origins come from the site's real integrations: PostHog
// (analytics), the Google Maps embed, and the Zapier chatbot. Fonts are
// self-hosted by next/font, so no external font origin is needed.
// 'unsafe-inline' stays for now (Next's inline bootstrap + Tailwind); tighten to
// nonces/hashes when enforcing. 'unsafe-eval' is intentionally omitted so
// report-only surfaces anything that still needs it.
// Builds that load Margin (RoundTwenty's review layer, lib/margin.js) let its
// script and API in; its passcode curtain also loads two Google Fonts.
const marginBuild = marginOn();
const margin = marginBuild ? ` ${MARGIN_ORIGIN}` : "";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline' https://*.posthog.com https://*.i.posthog.com https://interfaces.zapier.com${margin}`,
  `style-src 'self' 'unsafe-inline'${marginBuild ? " https://fonts.googleapis.com" : ""}`,
  "img-src 'self' data: blob: https:",
  `font-src 'self' data:${marginBuild ? " https://fonts.gstatic.com" : ""}`,
  `connect-src 'self' https://*.posthog.com https://*.i.posthog.com https://*.zapier.com https://*.supabase.co https://connect.mailerlite.com${margin}`,
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
  ...(process.env.NEXT_BUILD_TARGET === "cloudflare"
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000" }]
    : []),
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
    return [
      { source: "/:path*", headers: securityHeaders },
      // The Worker's own *.workers.dev URL is a copy of the site, not the
      // site: keep it out of search so it never competes with the real
      // domain (as Cherrydock does).
      {
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.workers\\.dev" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
};

// withPayload injects the @payload-config alias and Payload's build tweaks.
const payloadConfig = withPayload(nextConfig);

// Cloudflare Workers build (scripts/cf.sh sets NEXT_BUILD_TARGET=cloudflare).
// drizzle-kit: Payload requires it only to push/migrate (dev, CLI), and
// withPayload keeps it out of the build, so on Workers the external `require`
// cannot resolve. Point it at a throwing stub instead. (pg-cloudflare, the
// other gap, is added to the trace after the build: scripts/cf-trace-extra.mjs.)
function forCloudflare(config) {
  return {
    ...config,
    serverExternalPackages: config.serverExternalPackages.filter(
      (name) =>
        !name.startsWith("drizzle-kit") &&
        !name.startsWith("@payloadcms/db-sqlite") &&
        !name.startsWith("@libsql"),
    ),
    turbopack: {
      ...config.turbopack,
      resolveAlias: {
        ...config.turbopack?.resolveAlias,
        "drizzle-kit/api": "./lib/cloudflare/drizzle-kit-stub.cjs",
        // The local SQLite sandbox adapter (payload.config.ts) would leave an
        // unresolvable @libsql/client import in the Worker.
        "@payloadcms/db-sqlite": "./lib/cloudflare/db-sqlite-stub.cjs",
      },
    },
  };
}

export default process.env.NEXT_BUILD_TARGET === "cloudflare"
  ? forCloudflare(payloadConfig)
  : payloadConfig;
