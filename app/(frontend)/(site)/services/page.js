import Link from "next/link";

import { IconArrowRight, IconInfo } from "@/components/icons/ds-icons";
import { getService, listServiceSlugs } from "@/lib/services-data";
import { getServiceIcon } from "@/lib/service-icons";

export const metadata = {
  title: "Services and information",
  description:
    "Browse every Lisbon Project service category — administrative processes, housing, health, education, legal help and more, with tips and mapped external services for migrants and refugees in Lisbon.",
  alternates: { canonical: "/services" },
};

// Server-rendered index of every service category. Unlike the category detail
// pages (client-rendered from the localStorage store), this hub reads the seed
// directly on the server, so its links are in the initial HTML — a crawlable map
// of the whole services tree and the destination for the "Browse services" CTA
// on the 404 page. Keeps the same card visual language as the home grid.
//
// Local slug→glyph map: the server seed carries no per-service iconKey (that
// lives in the client store), so we map each category to its DS glyph here. This
// is display-only and scoped to this page, so it can't affect the admin/home
// icon behaviour.
const CATEGORY_ICON = {
  "emergency-contacts": "PhoneCall",
  administration: "Building2",
  "education-training": "GraduationCap",
  "family-child-support": "UsersRound",
  "legal-assistance": "Scale",
  "health-wellbeing": "HeartPulse",
  housing: "Home",
  immigration: "IdCard",
  "community-integration": "HandHeart",
  transport: "Bus",
  "disability-support": "Accessibility",
  "legal-assistance-2": "Scale",
  "essential-support": "Package",
  "gender-sexuality": "Rainbow",
};

export default function ServicesIndexPage() {
  const services = listServiceSlugs().map((slug) => getService(slug));

  return (
    <section className="bg-bg-page">
      <div className="mx-auto max-w-[1680px] px-4 py-12 sm:px-6 lg:px-14 lg:py-16">
        <nav aria-label="Breadcrumb" className="mb-6 text-ds-xxs font-bold">
          <ol className="flex items-center gap-1.5 text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground hover:underline">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-foreground">Services and information</li>
          </ol>
        </nav>

        <header className="mb-10 flex items-start gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-dark text-primary-foreground">
            <IconInfo className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="font-heading text-ds-xxxl font-bold text-brand-dark">
              Services and information
            </h1>
            <p className="mt-2 max-w-2xl text-ds-s font-medium text-foreground">
              Everything the Lisbon Project maps for our community — pick a
              category to see contacts, guides and the most common processes.
            </p>
          </div>
        </header>

        <ul className="grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,480px),1fr))] gap-4">
          {services.map((service, i) => {
            const Icon = getServiceIcon(CATEGORY_ICON[service.slug]);
            return (
              <li
                key={service.slug}
                className="animate-enter"
                style={{ animationDelay: `${Math.min(i, 10) * 40}ms` }}
              >
                <Link
                  href={`/services/${service.slug}`}
                  className="group block rounded-lg focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
                >
                  <div className="flex h-full items-start gap-4 rounded-lg border-2 border-border bg-card p-5 transition-shadow group-hover:shadow-[0_16px_32px_rgba(7,24,23,0.07)]">
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                      <Icon className="size-5" strokeWidth={1.9} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-heading text-ds-s font-bold text-foreground">
                        {service.title}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-ds-xxs font-medium text-foreground">
                        {service.intro?.[0]}
                      </p>
                    </div>
                    <IconArrowRight className="mt-1 size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
