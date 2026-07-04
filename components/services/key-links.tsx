import Link from "next/link";

import { IconArrowRight, IconInfo } from "@/components/icons/ds-icons";
import { cn } from "@/lib/utils";

export type KeyLink = { label: string; href: string };

// "Key links" article section (Proposal 959:5943): the standard section header
// (brand-dark badge + xxxl title) over a short list of shortcut links —
// 13px bold teal labels with a 16px chevron, 8px between rows.
export function KeyLinks({
  title = "Key links",
  links,
  className,
}: {
  title?: string;
  links: KeyLink[];
  className?: string;
}) {
  if (!links.length) return null;
  return (
    <section
      className={cn(
        "ds-section-padding rounded-none bg-card xl:rounded-[3.5rem]",
        className
      )}
    >
      <div className="mx-auto max-w-[760px]">
        <header className="mb-6 flex items-center gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-dark text-primary-foreground">
            <IconInfo className="size-5" />
          </div>
          <h2 className="min-w-0 font-heading text-ds-xxxl font-bold text-brand-dark">
            {title}
          </h2>
        </header>
        <ul className="space-y-2">
          {links.map((link, i) => {
            const external = /^https?:/i.test(link.href);
            const rowClass =
              "inline-flex items-center gap-1 text-ds-xxs font-bold text-primary underline underline-offset-[3px] hover:text-brand-link";
            return (
              <li key={`${link.href}-${i}`}>
                {external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
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
    </section>
  );
}
