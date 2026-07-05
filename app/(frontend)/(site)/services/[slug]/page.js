import { ServiceCategoryView } from "@/components/services/service-category-view";
import { getService, listServiceSlugs } from "@/lib/services-data";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/site";

export function generateStaticParams() {
  return listServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  // Title carries no brand — the root layout's title template appends it.
  return {
    title: service.title,
    description: service.intro?.[0],
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function ServiceCategoryPage({ params }) {
  const { slug } = await params;
  const service = getService(slug);

  return (
    <>
      {service ? (
        <JsonLd
          data={breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Services and information", path: "/services" },
            { name: service.title, path: `/services/${slug}` },
          ])}
        />
      ) : null}
      <ServiceCategoryView slug={slug} />
    </>
  );
}
