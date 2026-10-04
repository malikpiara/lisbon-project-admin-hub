import Link from "next/link";

import {
  IconArrowRight,
  IconContactBook,
  IconGlobe,
  IconInfo,
  IconLocation,
} from "@/components/icons/ds-icons";
import { cn } from "@/lib/utils";

export type KeyLink = { label: string; href: string };

// PROTOTYPE (team feedback, 2026-10): "Key links" is now three optional cards
// — Websites / Contacts / Locations (Figma 3805:13877, card-keylinks). A card
// with no entries is not rendered; with no entries anywhere the whole block
// disappears, so an article that has no shortcuts shows no empty box.
//
// Pre-prototype shape (single `links` list) still works: it fills the
// Websites card alone, which is exactly the old single-list layout's intent.
function KeyLinkCard({
  icon: Icon,
  title,
  links,
  keyBase,
}: {
  icon: (p: { className?: string }) => React.ReactNode;
  title: string;
  links: KeyLink[];
  keyBase: string;
}) {
  const rowClass =
    "inline-flex items-center gap-1 text-ds-xxs font-bold text-primary underline underline-offset-[3px] hover:text-brand-link";
  return (
    <div className="rounded-lg border-2 border-brand-100 bg-card p-6">
      <h3 className="flex items-center gap-2 font-heading text-ds-s font-bold text-brand-dark">
        <Icon className="size-6 shrink-0 text-primary" />
        {title}
      </h3>
      <ul className="mt-4 space-y-2">
        {links.map((link, i) => {
          const external = /^(https?:|mailto:|tel:)/i.test(link.href);
          return (
            <li key={`${keyBase}-${link.href}-${i}`}>
              {external ? (
                <a
                  href={link.href}
                  {...(/^https?:/i.test(link.href)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={rowClass}
                >
                  {link.label}
                  <IconArrowRight className="size-4 shrink-0" />
                </a>
              ) : (
                <Link href={link.href} className={rowClass}>
                  {link.label}
                  <IconArrowRight className="size-4 shrink-0" />
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function KeyLinks({
  title = "Key links",
  lead,
  links,
  contacts = [],
  locations = [],
  className,
}: {
  title?: string;
  lead?: string;
  links: KeyLink[];
  contacts?: KeyLink[];
  locations?: KeyLink[];
  className?: string;
}) {
  const cards = [
    { key: "web", icon: IconGlobe, title: "Websites", links },
    { key: "contacts", icon: IconContactBook, title: "Contacts", links: contacts },
    { key: "locations", icon: IconLocation, title: "Locations", links: locations },
  ].filter((c) => c.links.length);
  if (!cards.length) return null;
  return (
    <section
      className={cn(
        "ds-section-padding rounded-none bg-card xl:rounded-[3.5rem]",
        className
      )}
    >
      <div className="mx-auto max-w-[1384px]">
        <header className="mb-6 flex items-center gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-dark text-primary-foreground">
            <IconInfo className="size-5" />
          </div>
          <h2 className="min-w-0 font-heading text-ds-xxxl font-bold text-brand-dark">
            {title}
          </h2>
        </header>
        {lead ? (
          <p className="mb-6 text-ds-m font-bold text-primary">{lead}</p>
        ) : null}
        {/* Three equal columns on wide screens, as in the layout; a card that
            is missing simply frees its column (the row stays left-aligned). */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => (
            <KeyLinkCard
              key={c.key}
              icon={c.icon}
              title={c.title}
              links={c.links}
              keyBase={c.key}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
