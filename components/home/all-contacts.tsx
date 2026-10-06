import {
  ContactsSection,
  type CategoryOption,
  type Contact,
} from "@/components/shared/contacts-section";
import { SITE_TEXT_DEFAULTS } from "@/lib/site-text-defaults";

type ServiceOption = { slug: string; title: string };

export function AllContacts({
  services = [],
  contacts = [],
  // Heading + subtitle are editable (site-text global, /admin/site-text).
  title = SITE_TEXT_DEFAULTS.contactsTitle,
  subtitle = SITE_TEXT_DEFAULTS.contactsSubtitle,
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
