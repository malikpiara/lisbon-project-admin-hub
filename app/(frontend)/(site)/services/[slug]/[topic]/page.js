import { ArticleView } from "@/components/services/article-view";
import { getService, listServiceSlugs } from "@/lib/services-data";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/site";

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
  // Title carries no brand — the root layout's title template appends it.
  return {
    title: `${t.title} · ${service.title}`,
    description: t.description,
    alternates: { canonical: `/services/${slug}/${topic}` },
  };
}

export default async function ArticlePage({ params }) {
  const { slug, topic } = await params;
  const service = getService(slug);
  const t = service?.topics.find((x) => x.slug === topic);

  return (
    <>
      {service && t ? (
        <JsonLd
          data={breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services and information", path: "/services" },
            { name: service.title, path: `/services/${slug}` },
            { name: t.title, path: `/services/${slug}/${topic}` },
          ])}
        />
      ) : null}
      <ArticleView slug={slug} topicSlug={topic} />
    </>
  );
}
