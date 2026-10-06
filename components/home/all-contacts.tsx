import {
  ContactsSection,
  type CategoryOption,
  type Contact,
} from "@/components/shared/contacts-section";
import { HOME_PAGE_DEFAULTS } from "@/lib/home-page-defaults";

type ServiceOption = { slug: string; title: string };

export function AllContacts({
  services = [],
  contacts = [],
  // Heading + subtitle are editable (home-page global, /admin/home-page).
  title = HOME_PAGE_DEFAULTS.contactsTitle,
  subtitle = HOME_PAGE_DEFAULTS.contactsSubtitle,
}: {
  services?: ServiceOption[];
  contacts?: Contact[];
  title?: string;
  subtitle?: string;
}) {
  // The home table shows the WHOLE directory; the dropdown lists every service
  // category (same list every category page uses), default "All Categories".
  const categories: CategoryOption[] = services.map((s) => ({
    value: s.slug,
    label: s.title,
  }));

  // ContactsSection renders its own <section id="contacts"> anchor + scroll-margin,
  // so no wrapper is needed here (a wrapper would duplicate the id).
  return (
    <ContactsSection
      title={title}
      subtitle={subtitle}
      contacts={contacts}
      categories={categories}
      defaultCategory="all"
    />
  );
}
