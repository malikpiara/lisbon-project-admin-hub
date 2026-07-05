import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

// Allow the public site; keep crawlers out of the app surfaces (auth-gated admin,
// the Payload CMS, API routes, login, internal previews and the DS gallery).
// Those either redirect or aren't public content, so indexing them only wastes
// crawl budget and risks a stray login page in results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/cms-admin",
        "/api",
        "/login",
        "/preview",
        "/payload-demo",
        "/components",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
