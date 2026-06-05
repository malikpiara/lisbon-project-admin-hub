"use client";

import Link from "next/link";
import {
  Accessibility,
  Building2,
  Bus,
  ChevronRight,
  FileText,
  GraduationCap,
  Heart,
  HeartPulse,
  Home,
  Info,
  Package,
  Phone,
  Scale,
  Shield,
  Wallet,
} from "lucide-react";
import { useAdmin } from "@/lib/admin-store";

const iconMap = {
  Phone,
  Building2,
  GraduationCap,
  Heart,
  Wallet,
  HeartPulse,
  Home,
  FileText,
  Shield,
  Bus,
  Accessibility,
  Scale,
  Package,
};

export function ServicesGrid() {
  const { data } = useAdmin();
  const services = data.services;

  return (
    <section className="bg-bg-page">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-14">
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/5 sm:p-10">
          <header className="mb-8 flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-dark text-primary-foreground">
              <Info className="size-5" />
            </div>
            <h2 className="font-heading text-ds-xxl font-medium tracking-tight text-primary">
              Services and Information
            </h2>
          </header>

          <div className="grid gap-4 lg:grid-cols-2">
            {services.map((service) => {
              const Icon = iconMap[service.iconKey] ?? Building2;
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex h-full items-start gap-4 rounded-xl border border-border bg-card p-5 transition-shadow group-hover:shadow-md">
                    <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-ds-s font-medium text-foreground">
                        {service.title}
                      </h3>
                      <p className="mt-1 text-ds-xs text-muted-foreground">
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
