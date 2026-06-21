import { Hero } from "@/components/home/hero";
import { ServicesGrid } from "@/components/home/services-grid";
import { AllContacts } from "@/components/home/all-contacts";
import { MapVisit } from "@/components/home/map-visit";

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
