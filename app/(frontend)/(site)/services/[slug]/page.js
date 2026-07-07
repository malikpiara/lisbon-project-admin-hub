import { notFound } from "next/navigation";

import { ServiceCategoryView } from "@/components/services/service-category-view";
import {
  getPublicService,
  getPublicContacts,
  getPublicServices,
} from "@/lib/content";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/site";

// Rendered on-demand (ISR), not prebuilt at `next build`: prerendering every
// category + article page would open (build workers × DB pool) connections at
// once and blow past the Supabase session pooler's 15-client cap. Each page
// instead renders on first request, caches its HTML, and is invalidated by the
// admin's revalidatePublicContent(). Prod may switch this back to full SSG once
// DATABASE_URI points at the transaction pooler (see RELEASE-CHECKLIST §3).
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const service = await getPublicService(slug);
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
  const [service, contacts, services] = await Promise.all([
    getPublicService(slug),
    getPublicContacts(),
    getPublicServices(),
  ]);

  if (!service) notFound();

  // The filter dropdown lists every service category — same list on every page.
  const categories = services.map((s) => ({ value: s.slug, label: s.title }));

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Services and information", path: "/services" },
          { name: service.title, path: `/services/${slug}` },
        ])}
      />
      <ServiceCategoryView
        service={service}
        contacts={contacts}
        categories={categories}
      />
    </>
  );
}
