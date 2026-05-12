"use client";

import Link from "next/link";
import { ChevronRight, Plus, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdmin } from "@/lib/admin-store";

export default function ServicesAdminPage() {
  const { data, addService, resetSection } = useAdmin();

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Services & Information
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The {data.services.length} service categories shown on the home
            page. Click a category to edit its topics, contacts, and intro.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => resetSection("services")}
            className="h-9 gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button onClick={addService} className="h-9 gap-1.5">
            <Plus className="size-4" />
            Add category
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {data.services.map((service) => (
          <Link
            key={service.slug}
            href={`/admin/services/${service.slug}`}
            className="group rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Card className="h-full flex-row items-start justify-between gap-3 border-border/60 p-5 transition-shadow group-hover:shadow-md">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-base font-semibold text-foreground">
                    {service.title}
                  </h2>
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-accent text-[10px] uppercase tracking-wider text-primary"
                  >
                    {service.tone}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {service.shortDescription || "No short description"}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {service.topics.length} topic
                  {service.topics.length === 1 ? "" : "s"} ·{" "}
                  {service.contacts.length} contact
                  {service.contacts.length === 1 ? "" : "s"}
                </p>
              </div>
              <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
