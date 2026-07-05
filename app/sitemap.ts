import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";
import { getService, listServiceSlugs } from "@/lib/services-data";

// Enumerates every public URL from the same seed the routes are built from
// (services-data), so the sitemap can't drift from generateStaticParams. The
// admin/CMS/api routes are deliberately excluded (see robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/calendar"), lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const servicePages: MetadataRoute.Sitemap = listServiceSlugs().flatMap((slug) => {
    const service = getService(slug);
    const category = {
      url: absoluteUrl(`/services/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    };
    const topics: MetadataRoute.Sitemap = (service?.topics ?? []).map((topic) => ({
      url: absoluteUrl(`/services/${slug}/${topic.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));
    return [category, ...topics];
  });

  return [...staticPages, ...servicePages];
}
