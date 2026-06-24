"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Database,
  ExternalLink,
  LayoutDashboard,
  ListChecks,
  Sparkles,
} from "lucide-react";

import { SaveStatus } from "@/components/admin/save-status";
import { cn } from "@/lib/utils";

// Shared sidebar for the team workspace — used by both /admin (content editor)
// and /insights (analytics). The Payload CMS lives in its own app at /cms-admin
// (separate root layout, no design system), so it's a link out, not a shared route.
const navGroups = [
  {
    title: "Content",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/quick-access", label: "Quick Access", icon: Sparkles },
      { href: "/admin/services", label: "Services & Information", icon: ListChecks },
      { href: "/cms-admin", label: "CMS (Payload)", icon: Database },
    ],
  },
  {
    title: "Analytics",
    items: [{ href: "/insights", label: "Insights", icon: BarChart3 }],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r-2 border-border bg-bg-page px-4 py-6">
      <div className="mb-6 px-2">
        <p className="font-heading text-ds-s font-bold text-brand-dark">
          Admin Hub
        </p>
        <p className="mt-1 text-ds-xxs font-medium text-muted-foreground">
          Team workspace
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
        {pathname.startsWith("/admin") ? <SaveStatus /> : null}
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
