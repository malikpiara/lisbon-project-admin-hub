"use client";

import Link from "next/link";
import { ArrowRight, ListChecks, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAdmin } from "@/lib/admin-store";

export default function AdminDashboardPage() {
  const { data, hydrated } = useAdmin();

  const tiles = [
    {
      title: "Quick Access",
      description: "The 4 link cards on the home page hero section.",
      href: "/admin/quick-access",
      count: data.quickAccess.length,
      icon: Sparkles,
    },
    {
      title: "Services & Information",
      description: "The 14 service categories shown in the Services grid.",
      href: "/admin/services",
      count: data.services.length,
      icon: ListChecks,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Content overview
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            This is a mock CMS for prototyping the editor experience. Changes
            are stored locally in your browser. The public site at /
            currently reads static seed data.
          </p>
        </div>
        <Badge
          variant="secondary"
          className="rounded-full bg-accent text-primary"
        >
          {hydrated ? "Local draft" : "Loading…"}
        </Badge>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <Link
              key={tile.href}
              href={tile.href}
              className="group rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Card className="h-full gap-3 border-border/60 p-6 transition-shadow group-hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-lg bg-accent text-primary">
                    <Icon className="size-5" />
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {tile.title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tile.description}
                  </p>
                </div>
                <p className="text-sm font-medium text-primary">
                  {tile.count} item{tile.count === 1 ? "" : "s"}
                </p>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
