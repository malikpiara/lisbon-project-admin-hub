import { Hero } from "@/components/home/hero";
import { ServicesGrid } from "@/components/home/services-grid";
import { AllContacts } from "@/components/home/all-contacts";
import { MapVisit } from "@/components/home/map-visit";

// Title + description inherit the public defaults from the root layout; just
// pin the canonical so the homepage is unambiguous to crawlers.
export const metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <AllContacts />
      <MapVisit />
    </>
  );
}
