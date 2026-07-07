import { notFound } from "next/navigation";

import { ArticleView } from "@/components/services/article-view";
import { getPublicTopic } from "@/lib/content";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/site";

// On-demand (ISR) — see the note in ../page.js. Nothing prebuilt at build time.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug, topic } = await params;
  const data = await getPublicTopic(slug, topic);
  if (!data) return {};
  // Title carries no brand — the root layout's title template appends it.
  return {
    title: `${data.topic.title} · ${data.service.title}`,
    description: data.topic.description,
    alternates: { canonical: `/services/${slug}/${topic}` },
  };
}

export default async function ArticlePage({ params }) {
  const { slug, topic } = await params;
  const data = await getPublicTopic(slug, topic);
  if (!data) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services and information", path: "/services" },
          { name: data.service.title, path: `/services/${slug}` },
          { name: data.topic.title, path: `/services/${slug}/${topic}` },
        ])}
      />
      <ArticleView service={data.service} topic={data.topic} />
    </>
  );
}
