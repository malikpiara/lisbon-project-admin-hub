"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink, ListChecks, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdmin } from "@/lib/admin-store";

export default function AdminDashboardPage() {
  const { data, hydrated } = useAdmin();

  const tiles = [
    {
      title: "Quick Access",
      description: "Link cards in the home hero.",
      href: "/admin/quick-access",
      count: data.quickAccess.length,
      noun: "card",
      icon: Sparkles,
    },
    {
      title: "Services & Information",
      description: "Categories in the Services grid.",
      href: "/admin/services",
      count: data.services.length,
      noun: "category",
      nounPlural: "categories",
      icon: ListChecks,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-ds-xxxl font-bold text-foreground">
            Content overview
          </h1>
          <p className="mt-2 max-w-xl text-ds-xs font-medium text-muted-foreground">
            Edit the home page content. Changes save in your browser — the live
            site still reads seed data.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            View live site
            <ExternalLink className="size-3.5" />
          </Link>
          <Badge variant="outline">
            {hydrated ? "Local draft" : "Loading…"}
          </Badge>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const plural = tile.nounPlural ?? `${tile.noun}s`;
          return (
            <Link
              key={tile.href}
              href={tile.href}
              className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <div className="flex flex-col gap-3 px-4 xl:px-6">
                  <div className="flex items-center justify-between">
                    <span className="grid size-14 place-items-center rounded-lg bg-brand-100 text-primary">
                      <Icon className="size-6" strokeWidth={1.9} />
                    </span>
                    <ArrowRight className="size-4 text-primary transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-ds-l font-bold text-foreground">
                      {tile.title}
                    </h2>
                    <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
                      {tile.description}
                    </p>
                  </div>
                  <p className="text-ds-xs font-bold text-primary">
                    {tile.count} {tile.count === 1 ? tile.noun : plural}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
