import { Hero } from "@/components/home/hero";
import { QuickAccess } from "@/components/home/quick-access";
import { ServicesGrid } from "@/components/home/services-grid";
import { SupportHours } from "@/components/home/support-hours";
import { VisitUs } from "@/components/shared/visit-us";

export default function Home() {
  return (
    <>
      <Hero />
      <QuickAccess />
      <ServicesGrid />
      <SupportHours />
      <VisitUs />
    </>
  );
}
