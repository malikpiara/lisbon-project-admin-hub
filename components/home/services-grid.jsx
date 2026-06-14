"use client";

import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import { useAdmin } from "@/lib/admin-store";
import { getServiceIcon, getServiceIconKey } from "@/lib/service-icons";

export function ServicesGrid() {
  const { data } = useAdmin();
  const services = data.services;

  return (
    <section className="bg-bg-page">
      <div className="mx-auto max-w-[1680px] px-4 pb-16 sm:px-6 lg:px-14">
        <div className="ds-section-padding rounded-none xl:rounded-[3.5rem] bg-card">
          <header className="mb-10 flex items-center gap-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-dark text-primary-foreground">
              <Info className="size-5" strokeWidth={1.9} />
            </div>
            <h2 className="min-w-0 font-heading text-ds-xxxl font-bold text-brand-dark">
              Services and Information
            </h2>
          </header>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,480px),1fr))] gap-4">
            {services.map((service) => {
              const Icon = getServiceIcon(
                getServiceIconKey(service.slug, service.iconKey)
              );
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group rounded-lg focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
                >
                  <div className="flex h-full items-start gap-4 rounded-lg border-2 border-border bg-card p-5 transition-shadow group-hover:shadow-[0_16px_32px_rgba(7,24,23,0.07)]">
                    <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                      <Icon className="size-5" strokeWidth={1.9} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-ds-s font-bold text-foreground">
                        {service.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-ds-xxs font-medium text-foreground">
                        {service.shortDescription}
                      </p>
                    </div>
                    <ChevronRight className="mt-1 size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
