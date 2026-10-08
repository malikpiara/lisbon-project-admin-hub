import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CardShortcut } from "@/components/ui/card";
import {
  IconArrowRight,
  IconHeartOpen,
  IconTip,
  IconUserPlus,
} from "@/components/icons/ds-icons";
import { legacyCardMeta, quickAccessCta } from "@/lib/quick-access-defaults";
import { getServiceIcon } from "@/lib/service-icons";

// Legacy per-card icon, keyed by the card's href — how every card's glyph was
// chosen until October 2026, so cards saved before the icon field keep the
// glyph they had. New picks are DS iconography names stored on the card. The
// button label works the same way (lib/quick-access-defaults).
const cardIcons = {
  "/register": IconUserPlus,
  "/donate": IconTip,
  "https://lisbonproject.org": IconHeartOpen,
  "/internal": IconArrowRight,
};

export function QuickAccess({ items = [], embedded = false }) {
  const content = (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
      {items.map((item) => {
        const Icon = item.iconKey
          ? getServiceIcon(item.iconKey)
          : (cardIcons[item.href] ?? IconArrowRight);
        // The stored label wins; empty falls back to the card's legacy default.
        const cta = quickAccessCta(item);
        // A card's legacy meta may pin its destination (Donate → charity site);
        // otherwise use the stored href/external flag.
        const legacy = legacyCardMeta[item.href] ?? {};
        const href = legacy.href ?? item.href;
        const external = legacy.external ?? item.external;
        return (
          <CardShortcut
            key={item.id}
            className="transition-shadow hover:shadow-[0_18px_36px_rgba(7,24,23,0.08)]"
            // 56px, as the Figma card draws it. The DS <Icon> wrapper (used for
            // picked glyphs) defaults to 24px and isn't a bare <svg>, so the
            // card's own [&>svg]:size-14 rule doesn't reach it.
            icon={<Icon aria-hidden className="size-14" />}
            title={item.title}
            description={item.description}
            action={
              <Link
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className={buttonVariants({ className: "w-fit" })}
              >
                {cta}
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
