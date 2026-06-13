"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export type StyleguideNavGroup = {
  title: string;
  items: {
    slug: string;
    title: string;
    status?: string;
  }[];
};

export function StyleguideNav({ groups }: { groups: StyleguideNavGroup[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-8">
      {groups.map((group) => (
        <div key={group.title}>
          <p className="px-2 text-ds-xxs font-bold uppercase text-muted-foreground">
            {group.title}
          </p>
          <div className="mt-2 space-y-1">
            {group.items.map((item) => {
              const href = `/components/${item.slug}`;
              const active = pathname === href;

              return (
                <Link
                  key={item.slug}
                  href={href}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-ds-xs font-bold text-foreground transition-colors hover:bg-muted",
                    active && "bg-muted text-primary"
                  )}
                >
                  <span>{item.title}</span>
                  {item.status ? (
                    <span className="rounded-lg bg-secondary px-2 py-0.5 text-[0.68rem] font-bold text-brand-dark">
                      {item.status}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
