"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { InputSearch } from "@/components/ui/input";
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
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K focuses the component search from anywhere on the page.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.title.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, query]);

  return (
    <nav className="space-y-8">
      <InputSearch
        ref={searchRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search components... ⌘K"
        aria-label="Search components"
        className="h-10 text-ds-xxs"
      />
      {filtered.length === 0 ? (
        <p className="px-2 text-ds-xxs font-medium text-muted-foreground">
          No components match “{query}”.
        </p>
      ) : null}
      {filtered.map((group) => (
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
                    "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-ds-xs font-bold text-foreground transition-colors hover:bg-muted",
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
