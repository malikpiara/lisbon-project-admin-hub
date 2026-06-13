"use client";

import Link from "next/link";
import {
  ChevronRight,
  Globe2,
  HeartHandshake,
  LockKeyhole,
  UserRoundCheck,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdmin } from "@/lib/admin-store";

// Per-card icon + call-to-action, keyed by the quick-access item id.
const cardMeta = {
  register: { icon: UserRoundCheck, cta: "Get Started" },
  donate: { icon: HeartHandshake, cta: "Donate Now" },
  "lp-website": { icon: Globe2, cta: "Visit Website" },
  internal: { icon: LockKeyhole, cta: "Open Portal" },
};

export function QuickAccess({ embedded = false }) {
  const { data } = useAdmin();
  const items = data.quickAccess;
  const content = (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
      {items.map((item) => {
        const meta = cardMeta[item.id] ?? { icon: ChevronRight, cta: "Learn more" };
        const Icon = meta.icon;
        return (
          <Card
            key={item.id}
            className="py-0 transition-shadow hover:shadow-[0_18px_36px_rgba(7,24,23,0.08)]"
          >
            <CardContent className="flex h-full flex-col gap-4 p-6">
              <Icon
                className="size-14 text-primary"
                strokeWidth={1.9}
                aria-hidden
              />
              <div className="flex-1">
                <h3 className="font-heading text-ds-l font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-1 text-ds-s font-medium text-foreground">
                  {item.description}
                </p>
              </div>
              <Link
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={buttonVariants({
                  className: "mt-1 w-fit",
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
  );

  if (embedded) return content;

  return (
    <section className="bg-bg-page">
      <div className="mx-auto max-w-[1680px] px-4 pb-16 sm:px-6 lg:px-14">
        <div className="ds-section-x-padding">
          {content}
        </div>
      </div>
    </section>
  );
}
