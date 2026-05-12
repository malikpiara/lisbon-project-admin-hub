"use client";

import Link from "next/link";
import {
  Accessibility,
  ArrowRight,
  Building2,
  Bus,
  FileText,
  GraduationCap,
  Heart,
  HeartPulse,
  Home,
  Package,
  Phone,
  Scale,
  Shield,
  Wallet,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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

const toneStyles = {
  rose: {
    border: "border-l-rose-400",
    iconBg: "bg-rose-100",
    iconText: "text-rose-500",
  },
  teal: {
    border: "border-l-teal-400",
    iconBg: "bg-teal-100",
    iconText: "text-teal-600",
  },
  violet: {
    border: "border-l-violet-400",
    iconBg: "bg-violet-100",
    iconText: "text-violet-600",
  },
  pink: {
    border: "border-l-pink-400",
    iconBg: "bg-pink-100",
    iconText: "text-pink-500",
  },
  emerald: {
    border: "border-l-emerald-400",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-600",
  },
  cyan: {
    border: "border-l-cyan-400",
    iconBg: "bg-cyan-100",
    iconText: "text-cyan-600",
  },
  orange: {
    border: "border-l-orange-400",
    iconBg: "bg-orange-100",
    iconText: "text-orange-500",
  },
  blue: {
    border: "border-l-blue-400",
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
  },
};

export function ServicesGrid() {
  const { data } = useAdmin();
  const services = data.services;

  return (
    <section className="bg-bg-mint">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Services and Information
        </h2>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {services.map((service) => {
            const tone = toneStyles[service.tone] ?? toneStyles.teal;
            const Icon = iconMap[service.iconKey] ?? Building2;
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Card
                  className={`flex-row items-start gap-4 border-l-4 ${tone.border} bg-card p-5 transition-shadow group-hover:shadow-md`}
                >
                  <div
                    className={`grid size-11 shrink-0 place-items-center rounded-lg ${tone.iconBg} ${tone.iconText}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold leading-snug text-foreground">
                      {service.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {service.shortDescription}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
