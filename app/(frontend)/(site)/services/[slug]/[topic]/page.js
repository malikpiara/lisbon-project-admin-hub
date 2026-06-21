import { ArticleView } from "@/components/services/article-view";
import { getService, listServiceSlugs } from "@/lib/services-data";

export function generateStaticParams() {
  const params = [];
  for (const slug of listServiceSlugs()) {
    const service = getService(slug);
    for (const topic of service?.topics ?? []) {
      params.push({ slug, topic: topic.slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }) {
  const { slug, topic } = await params;
  const service = getService(slug);
  const t = service?.topics.find((x) => x.slug === topic);
  if (!service || !t) return {};
  return {
    title: `${t.title} · ${service.title} · Lisbon Project`,
    description: t.description,
  };
}

export default async function ArticlePage({ params }) {
  const { slug, topic } = await params;
  return <ArticleView slug={slug} topicSlug={topic} />;
}
