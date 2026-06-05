"use client";

import Link from "next/link";
import {
  ArrowDownRight,
  ChevronRight,
  HandHeart,
  Heart,
  UserPlus,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdmin } from "@/lib/admin-store";

// Per-card icon + call-to-action, keyed by the quick-access item id.
const cardMeta = {
  register: { icon: UserPlus, cta: "Get Started" },
  donate: { icon: HandHeart, cta: "Donate Now" },
  "lp-website": { icon: Heart, cta: "Visit Website" },
  internal: { icon: ArrowDownRight, cta: "Open Portal" },
};

export function QuickAccess() {
  const { data } = useAdmin();
  const items = data.quickAccess;

  return (
    <section className="bg-bg-page">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const meta = cardMeta[item.id] ?? { icon: ChevronRight, cta: "Learn more" };
            const Icon = meta.icon;
            return (
              <Card
                key={item.id}
                className="border border-border ring-0 transition-shadow hover:shadow-md"
              >
                <CardContent className="flex h-full flex-col gap-3 p-6">
                  <Icon className="size-7 text-primary" aria-hidden />
                  <div className="flex-1">
                    <h3 className="font-heading text-ds-l font-medium text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-ds-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <Link
                    href={item.href}
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className={buttonVariants({
                      className: "mt-1 h-11 w-fit px-4",
                    })}
                  >
                    {meta.cta}
                    <ChevronRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
