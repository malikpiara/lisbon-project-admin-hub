"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  ViewTransition,
} from "react";
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
  // The input is driven by the urgent `query` (typing stays snappy); filtering
  // reads the deferred value. A deferred update is a Transition, which is what
  // activates the <ViewTransition> below — so the result list cross-fades.
  const deferredQuery = useDeferredValue(query);
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
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          item.title.toLowerCase().includes(q)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, deferredQuery]);

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
      {/* Only the result list cross-fades — the input sits outside the boundary
          and stays put. The deferred query (above) makes each filter change a
          Transition, which is what drives the <ViewTransition>. Timing +
          reduced-motion come from the global ::view-transition-* rules. */}
      <ViewTransition>
        <div className="space-y-8">
          {filtered.length === 0 ? (
            <p className="px-2 text-ds-xxs font-medium text-muted-foreground">
              No components match “{deferredQuery}”.
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
        </div>
      </ViewTransition>
    </nav>
  );
}
