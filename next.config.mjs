import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Bundle: transform barrel imports (lucide-react is used in 16 files) into
    // direct per-icon imports at build time so unused icons are tree-shaken.
    // (Vercel best practice: bundle-barrel-imports.)
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

// withPayload injects the @payload-config alias and Payload's build tweaks.
export default withPayload(nextConfig);
