"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CardShortcut } from "@/components/ui/card";
import {
  IconHeartOpen,
  IconInternalLink,
  IconTip,
  IconUserPlus,
} from "@/components/icons/ds-icons";
import { useAdmin } from "@/lib/admin-store";

// Per-card icon + call-to-action, keyed by the quick-access item id.
// Icons are the actual DS glyphs exported from Figma (iconography page):
// user/plus, tip (donor), heart-open, internal-link.
const cardMeta = {
  register: { icon: IconUserPlus, cta: "Get Started" },
  donate: { icon: IconTip, cta: "Donate Now" },
  "lp-website": { icon: IconHeartOpen, cta: "Visit Website" },
  internal: { icon: IconInternalLink, cta: "Open Portal" },
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
          <CardShortcut
            key={item.id}
            className="transition-shadow hover:shadow-[0_18px_36px_rgba(7,24,23,0.08)]"
            icon={<Icon aria-hidden />}
            title={item.title}
            description={item.description}
            action={
              <Link
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={buttonVariants({ className: "w-fit" })}
              >
                {meta.cta}
                <ChevronRight className="size-4" />
              </Link>
            }
          />
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
