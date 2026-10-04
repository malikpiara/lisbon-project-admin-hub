import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";
import { getPublicServices, listTopicParams } from "@/lib/content";

// Enumerates every public URL from Payload, through the same lib/content.js
// queries the category and article pages resolve against, so the sitemap lists
// exactly the pages that exist. (It used to read the lib/services-data seed,
// which stopped feeding the routes on 2026-07-07; by 2026-09-28, 141 of its 158
// URLs were 404s.) The admin/CMS/api routes are deliberately excluded (see
// robots.ts).
//
// Static at build time. An admin edit calls revalidatePath("/", "layout")
// (lib/revalidate-public.js), whose "/layout" tag every route carries, this
// one included, so new or renamed articles appear without a redeploy.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [services, allTopicParams] = await Promise.all([
    getPublicServices(),
    listTopicParams(),
  ]);
  // lib/content.js drops orphaned topics with .filter(Boolean), which JS
  // inference can't see; narrow here so the types match.
  const topicParams = allTopicParams.filter(
    (p): p is { slug: string; topic: string } => p !== null,
  );

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/calendar"), lastModified: now, changeFrequency: "daily", priority: 0.6 },
    { url: absoluteUrl("/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Each category followed by its articles, in the home-grid order.
  const servicePages: MetadataRoute.Sitemap = services.flatMap(({ slug }: { slug: string }) => [
    {
      url: absoluteUrl(`/services/${slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    ...topicParams
      .filter((p) => p.slug === slug)
      .map((p) => ({
        url: absoluteUrl(`/services/${slug}/${p.topic}`),
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
  ]);

  return [...staticPages, ...servicePages];
}
