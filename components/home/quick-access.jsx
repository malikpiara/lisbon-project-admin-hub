import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CardShortcut } from "@/components/ui/card";
import {
  IconArrowRight,
  IconHeartOpen,
  IconInternalLink,
  IconTip,
  IconUserPlus,
} from "@/components/icons/ds-icons";

// Per-card icon + call-to-action, keyed by the card's href (stable across the
// seed and Payload, whose auto-increment ids differ from the seed's string ids).
// Icons are the actual DS glyphs exported from Figma (iconography page):
// user/plus, tip (donor), heart-open, internal-link.
const cardMeta = {
  "/register": { icon: IconUserPlus, cta: "Get Started" },
  "/donate": { icon: IconTip, cta: "Donate Now" },
  "https://lisbonproject.org": { icon: IconHeartOpen, cta: "Visit Website" },
  "/internal": { icon: IconInternalLink, cta: "Open Portal" },
};

export function QuickAccess({ items = [], embedded = false }) {
  const content = (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
      {items.map((item) => {
        const meta = cardMeta[item.href] ?? { icon: IconArrowRight, cta: "Learn more" };
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
                <IconArrowRight className="size-4" />
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
