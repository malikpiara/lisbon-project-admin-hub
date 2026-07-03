import Link from "next/link";

import { Tag } from "@/components/ui/tag";
import { COMPONENT_DOCS, STYLEGUIDE_NAV_GROUPS } from "./_components/styleguide-docs";
import { COMPONENT_THUMBNAILS } from "./_components/component-thumbnails";

// Astryx-style browse gallery: one preview card per component, grouped the
// same way as the sidebar, with a live mini-render on the card canvas.
export default function StyleguideIndexPage() {
  return (
    <div className="space-y-14">
      <header className="max-w-4xl space-y-4">
        <Tag>Living style guide</Tag>
        <h1 className="font-heading text-ds-xxxxl font-bold text-foreground">
          Browse the library
        </h1>
        <p className="text-ds-l font-medium text-muted-foreground">
          Every token, component, and composed block in the Lisbon Project app —
          what each one is for, its exact API, and how to keep the next site
          consistent with the design.
        </p>
      </header>

      {STYLEGUIDE_NAV_GROUPS.map((group) => (
        <section key={group.title} className="space-y-5">
          <h2 className="font-heading text-ds-xxl font-bold text-foreground">
            {group.title}
          </h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {group.items.map((item) => {
              const doc = COMPONENT_DOCS.find((d) => d.slug === item.slug);
              const thumbnail = COMPONENT_THUMBNAILS[item.slug];
              return (
                <Link
                  key={item.slug}
                  href={`/components/${item.slug}`}
                  className="group"
                >
                  <article className="h-full overflow-hidden rounded-lg ring-2 ring-border transition-shadow group-hover:shadow-[0_18px_36px_rgba(7,24,23,0.08)]">
                    <div className="pointer-events-none grid h-36 select-none place-items-center border-b-2 border-border bg-card px-6">
                      {thumbnail ?? (
                        <span className="font-heading text-ds-xxl font-bold text-brand-300">
                          {item.title.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 px-5 py-4">
                      <h3 className="font-heading text-ds-s font-bold text-foreground">
                        {item.title}
                      </h3>
                      {doc ? (
                        <p className="line-clamp-2 text-ds-xxs font-medium text-muted-foreground">
                          {doc.description}
                        </p>
                      ) : null}
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
