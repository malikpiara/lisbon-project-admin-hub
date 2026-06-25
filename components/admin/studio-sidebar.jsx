"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ExternalLink,
  FileText,
  FlaskConical,
  History,
  LayoutDashboard,
  ListChecks,
  Sparkles,
  Users2,
} from "lucide-react";

import { cn } from "@/lib/utils";

// Sidebar for the Payload-backed Studio (the real editor). Same DS shape as the
// /admin prototype's sidebar, wired to /studio routes. The prototype stays
// reachable from the footer for side-by-side comparison.
const navGroups = [
  {
    title: "Content",
    items: [
      { href: "/studio", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/studio/quick-access", label: "Quick Access", icon: Sparkles },
      { href: "/studio/services", label: "Services & Information", icon: ListChecks },
      { href: "/studio/topics", label: "Topics", icon: FileText },
    ],
  },
  {
    title: "Analytics",
    items: [
      { href: "/insights", label: "Insights", icon: BarChart3 },
      { href: "/studio/history", label: "History", icon: History },
    ],
  },
  {
    title: "Admin",
    items: [{ href: "/studio/users", label: "Team", icon: Users2 }],
  },
];

export function StudioSidebar({ userEmail }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col overflow-y-auto border-r-2 border-border bg-bg-page px-4 py-6">
      <div className="mb-6 px-2">
        <p className="font-heading text-ds-s font-bold text-brand-dark">
          Admin Hub
        </p>
        <p className="mt-1 text-ds-xxs font-medium text-muted-foreground">
          Content studio
        </p>
      </div>

      <nav className="space-y-5">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground">
              {group.title}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-ds-xs font-bold transition-colors",
                    active
                      ? "bg-secondary text-primary"
                      : "text-brand-link hover:bg-secondary/60"
                  )}
                >
                  <Icon className="size-4" strokeWidth={2} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto space-y-3 px-2 pt-6">
        {userEmail ? (
          <p className="truncate text-ds-xxs font-medium text-muted-foreground">
            Signed in as{" "}
            <span className="font-bold text-foreground">{userEmail}</span>
          </p>
        ) : null}
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-ds-xxs font-bold text-muted-foreground hover:text-foreground"
        >
          <FlaskConical className="size-3.5" />
          Prototype (/admin)
        </Link>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-ds-xxs font-bold text-brand-link hover:underline"
        >
          View live site
          <ExternalLink className="size-3.5" />
        </Link>
      </div>
    </aside>
  );
}
