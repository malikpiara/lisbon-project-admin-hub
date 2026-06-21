import { ServiceCategoryView } from "@/components/services/service-category-view";
import { getService, listServiceSlugs } from "@/lib/services-data";

export function generateStaticParams() {
  return listServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: `${service.title} · Lisbon Project`,
    description: service.intro?.[0],
  };
}

export default async function ServiceCategoryPage({ params }) {
  const { slug } = await params;
  return <ServiceCategoryView slug={slug} />;
}
