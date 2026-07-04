import { withPayload } from "@payloadcms/next/withPayload";

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
};

// withPayload injects the @payload-config alias and Payload's build tweaks.
export default withPayload(nextConfig);
