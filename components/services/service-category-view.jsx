"use client";

import Link from "next/link";
import { ServiceHero } from "@/components/services/service-hero";
import { CategoryQuickAccess } from "@/components/services/category-quick-access";
import { TopicsGrid } from "@/components/services/topics-grid";
import { ContactsTable } from "@/components/services/contacts-table";
import { VisitUs } from "@/components/shared/visit-us";
import { useAdmin } from "@/lib/admin-store";

export function ServiceCategoryView({ slug }) {
  const { data, hydrated } = useAdmin();
  const service = data.services.find((s) => s.slug === slug);

  if (!service) {
    if (!hydrated) return null;
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Service not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This category may have been removed or the link is incorrect.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <>
      <ServiceHero
        title={service.title}
        breadcrumb={service.breadcrumb}
        intro={service.intro}
      />
      <CategoryQuickAccess
        categoryLabel={service.breadcrumb.toLowerCase()}
      />
      <TopicsGrid topics={service.topics} categorySlug={service.slug} />
      <ContactsTable
        title={service.contactsTitle ?? `${service.title} Contacts`}
        subtitle={service.contactsSubtitle}
        contacts={service.contacts}
        categoryFilters={service.categoryFilters}
      />
      <VisitUs />
    </>
  );
}
