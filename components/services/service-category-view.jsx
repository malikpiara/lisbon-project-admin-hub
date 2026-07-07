"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";
import { ServiceHero } from "@/components/services/service-hero";
import { TopicsGrid } from "@/components/services/topics-grid";
import { ContactsSection } from "@/components/shared/contacts-section";
import { MapVisit } from "@/components/home/map-visit";
import { useAdmin } from "@/lib/admin-store";
import { getServiceIconKey } from "@/lib/service-icons";

export function ServiceCategoryView({ slug }) {
  const { data, hydrated } = useAdmin();
  const service = data.services.find((s) => s.slug === slug);

  // Analytics: `service_viewed` (object-action, past tense) — the semantic event
  // for "which services people visit", robust to URL changes (no $pathname
  // parsing). No-op until PostHog is configured. See docs/ANALYTICS.md.
  const posthog = usePostHog();
  useEffect(() => {
    if (!service) return;
    posthog?.capture("service_viewed", {
      service_slug: service.slug,
      service_name: service.title,
    });
  }, [service?.slug, posthog]);

  if (!service) {
    if (!hydrated) return null;
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-heading text-ds-xxl font-medium text-foreground">
          Service not found
        </h1>
        <p className="mt-2 text-ds-s text-muted-foreground">
          This category may have been removed or the link is incorrect.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-ds-s font-medium text-primary hover:underline"
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
        intro={service.intro}
        iconKey={getServiceIconKey(service.slug, service.iconKey)}
      />
      <TopicsGrid topics={service.topics} categorySlug={service.slug} />
      {/* Same global contacts directory as the home page — only the pre-selected
          filter differs. Landing here shows this category's contacts; the user
          can switch to any other category, or "All Contacts". */}
      <ContactsSection
        title={service.contactsTitle ?? `${service.title} Contacts`}
        subtitle={service.contactsSubtitle}
        contacts={data.contacts}
        categories={data.services.map((s) => ({ value: s.slug, label: s.title }))}
        defaultCategory={service.slug}
      />
      <MapVisit />
    </>
  );
}
