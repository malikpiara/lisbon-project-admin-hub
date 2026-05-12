"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  Sparkles,
} from "lucide-react";

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
    <aside className="w-60 shrink-0 border-r border-border/60 bg-bg-page/60 px-4 py-6">
      <div className="mb-6 px-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Admin Hub
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Mock CMS · changes saved locally
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
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-accent text-primary"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
