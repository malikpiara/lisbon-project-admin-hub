"use client";

import { ContactsSection, type Contact } from "@/components/shared/contacts-section";
import { useAdmin } from "@/lib/admin-store";

type ServiceData = {
  slug: string;
  contacts?: Contact[];
  categoryFilters?: string[];
  contactsSubtitle?: string;
};

export function AllContacts() {
  // Feature the family & childcare contacts (matches the DS mockup); fall back to first service.
  const { data } = useAdmin() as { data: { services: ServiceData[] } };
  const service =
    data.services.find((s) => s.slug === "family-child-support") ??
    data.services[0];

  return (
    <section id="contacts" className="scroll-mt-24">
      <ContactsSection
        title="All Contacts"
        subtitle={
          service?.contactsSubtitle ??
          "Key contact information for family and childcare services in Lisbon"
        }
        contacts={service?.contacts ?? []}
        categoryFilters={service?.categoryFilters ?? []}
      />
    </section>
  );
}
