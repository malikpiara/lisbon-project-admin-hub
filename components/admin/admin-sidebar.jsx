"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/quick-access", label: "Quick Access", icon: Sparkles },
  {
    href: "/admin/services",
    label: "Services & Information",
    icon: ListChecks,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r-2 border-border bg-bg-page px-4 py-6">
      <div className="mb-6 px-2">
        <p className="font-heading text-ds-s font-bold text-brand-dark">
          Admin Hub
        </p>
        <p className="mt-1 text-ds-xxs font-medium text-muted-foreground">
          Mock CMS · saved locally
        </p>
      </div>
      <nav className="space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
      </nav>
    </aside>
  );
}
