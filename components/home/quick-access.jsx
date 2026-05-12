"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAdmin } from "@/lib/admin-store";

export function QuickAccess() {
  const { data } = useAdmin();
  const items = data.quickAccess;

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Badge
          variant="secondary"
          className="rounded-full bg-accent px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent-foreground"
        >
          Quick Access
        </Badge>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="border-border/60 transition-shadow hover:shadow-md"
            >
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div
                  aria-hidden
                  className="size-12 shrink-0 rounded-xl bg-brand-yellow"
                />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Link
                  href={item.href}
                  {...(item.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Learn more
                  <ArrowRight className="size-3.5" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
