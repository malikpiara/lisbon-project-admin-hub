import {
  ContactsSection,
  type CategoryOption,
  type Contact,
} from "@/components/shared/contacts-section";

type ServiceOption = { slug: string; title: string };

export function AllContacts({
  services = [],
  contacts = [],
}: {
  services?: ServiceOption[];
  contacts?: Contact[];
}) {
  // The home table shows the WHOLE directory; the dropdown lists every service
  // category (same list every category page uses), default "All Contacts".
  const categories: CategoryOption[] = services.map((s) => ({
    value: s.slug,
    label: s.title,
  }));

  // ContactsSection renders its own <section id="contacts"> anchor + scroll-margin,
  // so no wrapper is needed here (a wrapper would duplicate the id).
  return (
    <ContactsSection
      title="All Contacts"
      subtitle="Key contact information across every service in Lisbon"
      contacts={contacts}
      categories={categories}
      defaultCategory="all"
    />
  );
}
