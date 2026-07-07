"use client";

import {
  ContactsSection,
  type CategoryOption,
  type Contact,
} from "@/components/shared/contacts-section";
import { useAdmin } from "@/lib/admin-store";

type ServiceData = { slug: string; title: string };

export function AllContacts() {
  // The home table shows the WHOLE directory: every contact from every service,
  // with the filter defaulting to "All Contacts". The dropdown lists all service
  // categories (the same list every category page uses).
  const { data } = useAdmin() as {
    data: { services: ServiceData[]; contacts: Contact[] };
  };

  const categories: CategoryOption[] = data.services.map((s) => ({
    value: s.slug,
    label: s.title,
  }));

  return (
    <section id="contacts" className="scroll-mt-24">
      <ContactsSection
        title="All Contacts"
        subtitle="Key contact information across every service in Lisbon"
        contacts={data.contacts}
        categories={categories}
        defaultCategory="all"
      />
    </section>
  );
}
