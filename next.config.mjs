import { withPayload } from "@payloadcms/next/withPayload";

// Baseline security headers applied to every response. Deliberately conservative:
//   • No Content-Security-Policy here — a strict CSP would need to allowlist
//     PostHog, the Google Maps embed, the Zapier chatbot iframe and Google Fonts,
//     and getting it wrong breaks the site. Left as a tracked follow-up.
//   • No Strict-Transport-Security — the hosting platform sets HSTS; forcing it
//     here risks an HTTP lockout in non-prod. See docs/SECURITY-AUDIT.md.
// X-Frame-Options: SAMEORIGIN blocks click-jacking while still allowing Payload's
// same-origin admin/live-preview framing.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
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
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// withPayload injects the @payload-config alias and Payload's build tweaks.
export default withPayload(nextConfig);
