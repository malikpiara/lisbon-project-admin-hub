"use client";

import Link from "next/link";
import { ChevronRight, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getServiceIcon, getServiceIconKey } from "@/lib/service-icons";
import { toneHex } from "@/lib/admin-tones";
import { useAdmin } from "@/lib/admin-store";

export default function ServicesAdminPage() {
  const { data, addService, resetSection } = useAdmin();

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-ds-xxl font-bold text-foreground">
            Services & Information
          </h1>
          <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
            {data.services.length} categories on the home grid. Open one to edit
            its topics, contacts, and intro.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => resetSection("services")}
          >
            <RotateCcw />
            Reset
          </Button>
          <Button size="sm" onClick={addService}>
            <Plus />
            Add category
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {data.services.map((service) => {
          const Icon = getServiceIcon(
            getServiceIconKey(service.slug, service.iconKey)
          );
          const tint = toneHex(service.tone);
          return (
            <Link
              key={service.slug}
              href={`/admin/services/${service.slug}`}
              className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <div className="flex items-start gap-4 px-4 xl:px-6">
                  <span
                    className="grid size-11 shrink-0 place-items-center rounded-lg"
                    style={{ backgroundColor: `${tint}1f`, color: tint }}
                  >
                    <Icon className="size-5" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-heading text-ds-s font-bold text-foreground">
                      {service.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-ds-xs font-medium text-muted-foreground">
                      {service.shortDescription || "No short description"}
                    </p>
                    <p className="mt-3 text-ds-xxs font-medium text-muted-foreground">
                      {service.topics.length} topic
                      {service.topics.length === 1 ? "" : "s"} ·{" "}
                      {service.contacts.length} contact
                      {service.contacts.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
