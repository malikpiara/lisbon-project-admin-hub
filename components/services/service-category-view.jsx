"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import { ServiceHero } from "@/components/services/service-hero";
import { TopicsGrid } from "@/components/services/topics-grid";
import { ContactsSection } from "@/components/shared/contacts-section";
import { MapVisit } from "@/components/home/map-visit";
import { getServiceIconKey } from "@/lib/service-icons";

// Presentational: the parent route fetches the service from Payload and passes
// it in (a missing slug 404s server-side via notFound(), so `service` is always
// valid here). Stays a client component only for the analytics capture.
export function ServiceCategoryView({ service, contacts = [], categories = [] }) {
  // Analytics: `service_viewed` (object-action, past tense) — the semantic event
  // for "which services people visit". No-op until PostHog is configured.
  const posthog = usePostHog();
  useEffect(() => {
    if (!service) return;
    posthog?.capture("service_viewed", {
      service_slug: service.slug,
      service_name: service.title,
    });
  }, [service?.slug, posthog]);

  if (!service) return null;

  return (
    <>
      <ServiceHero
        title={service.title}
        intro={service.intro}
        iconKey={getServiceIconKey(service.slug, service.iconKey)}
      />
      <TopicsGrid topics={service.topics} categorySlug={service.slug} />
      {/* Same global contacts directory as the home page — only the pre-selected
          filter differs (this category, switchable to any other or All Contacts). */}
      <ContactsSection
        title={service.contactsTitle || `${service.title} Contacts`}
        subtitle={service.contactsSubtitle}
        contacts={contacts}
        categories={categories}
        defaultCategory={service.slug}
      />
      <MapVisit />
    </>
  );
}
