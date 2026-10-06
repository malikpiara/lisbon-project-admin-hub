import { Hero } from "@/components/home/hero";
import { ServicesGrid } from "@/components/home/services-grid";
import { AllContacts } from "@/components/home/all-contacts";
import { MapVisit } from "@/components/home/map-visit";
import {
  getPublicServices,
  getPublicContacts,
  getPublicQuickAccess,
  getPublicHomeCopy,
} from "@/lib/content";

// Title + description inherit the public defaults from the root layout; just
// pin the canonical so the homepage is unambiguous to crawlers.
export const metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  // Read published content from Payload (the CMS) on the server. Statically
  // rendered; the admin's revalidatePath calls regenerate this on edits.
  const [services, contacts, quickAccess, copy] = await Promise.all([
    getPublicServices(),
    getPublicContacts(),
    getPublicQuickAccess(),
    getPublicHomeCopy(),
  ]);

  return (
    <>
      <Hero
        quickAccess={quickAccess}
        title={copy.heroTitle}
        lead={copy.heroLead}
        description={copy.heroDescription}
      />
      <ServicesGrid services={services} title={copy.servicesTitle} />
      <AllContacts
        services={services}
        contacts={contacts}
        title={copy.contactsTitle}
        subtitle={copy.contactsSubtitle}
      />
      <MapVisit />
    </>
  );
}
