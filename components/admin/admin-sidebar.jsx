"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// DS lacks these nav/utility glyphs (Dashboard, Quick Access, Services,
// Contacts, Insights, History, Review, close) — kept on lucide, flagged for Rafael.
import {
  BarChart3,
  ClipboardCheck,
  Contact,
  History,
  LayoutDashboard,
  ListChecks,
  Sparkles,
  X,
} from "lucide-react";

import {
  IconChatBot,
  IconInternalLink,
  IconMail,
  IconMenu,
  IconNotes,
  IconUsers,
} from "@/components/icons/ds-icons";
import { cn } from "@/lib/utils";

// The unified team-workspace sidebar for the /admin group — content editor
// (Quick Access / Services / Articles), analytics (Insights / History) and
// team management (admins only). The Payload CMS lives in its own app at
// /cms-admin (separate root layout), so it's reached directly, not from here.
const navGroups = [
  {
    title: "Content",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/quick-access", label: "Quick Access", icon: Sparkles },
      { href: "/admin/services", label: "Services & Information", icon: ListChecks },
      { href: "/admin/articles", label: "Articles", icon: IconNotes },
      { href: "/admin/contacts", label: "Contacts", icon: Contact },
    ],
  },
  {
    title: "Analytics",
    items: [
      { href: "/admin/insights", label: "Insights", icon: BarChart3 },
      { href: "/admin/conversations", label: "Conversations", icon: IconChatBot },
      { href: "/admin/history", label: "History", icon: History },
    ],
  },
  {
    title: "Admin",
    adminOnly: true,
    items: [
      // `badge: "pendingReviews"` renders the live count passed by the layout.
      {
        href: "/admin/review",
        label: "Review",
        icon: ClipboardCheck,
        badge: "pendingReviews",
      },
      { href: "/admin/users", label: "Team", icon: IconUsers },
      { href: "/admin/subscribers", label: "Subscribers", icon: IconMail },
    ],
  },
];

// The sidebar's inner markup, shared verbatim between the md+ <aside> and the
// mobile drawer so the two can never drift apart.
function SidebarContent({ userEmail, isAdmin, pathname, badges = {} }) {
  const groups = navGroups.filter((g) => !g.adminOnly || isAdmin);
  return (
    <>
      <div className="mb-6 px-2">
        <p className="font-heading text-ds-s font-bold text-brand-dark">
          Admin Hub
        </p>
        <p className="mt-1 text-ds-xxs font-medium text-muted-foreground">
          Team workspace
        </p>
      </div>

      <nav className="space-y-5">
        {groups.map((group) => (
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
                  {item.badge && badges[item.badge] > 0 ? (
                    <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-ds-xxs font-bold text-primary-foreground">
                      {badges[item.badge]}
                    </span>
                  ) : null}
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
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-fit items-center gap-1.5 text-ds-xxs font-bold text-brand-link hover:underline"
        >
          View live site
          <IconInternalLink className="size-3.5" />
        </Link>
        <Link
          href="/components"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-fit items-center gap-1.5 text-ds-xxs font-bold text-brand-link hover:underline"
        >
          Design system
          <IconInternalLink className="size-3.5" />
        </Link>
      </div>
    </>
  );
}

export function AdminSidebar({ userEmail, isAdmin = false, pendingReviews = 0 }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // The drawer is navigation: following a link should dismiss it.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes; the page behind a modal drawer must not scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const content = (
    <SidebarContent
      userEmail={userEmail}
      isAdmin={isAdmin}
      pathname={pathname}
      badges={{ pendingReviews }}
    />
  );

  return (
    <>
      {/* Mobile: slim sticky header; the nav lives in the drawer below. */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b-2 border-border bg-card px-4 md:hidden">
        <p className="font-heading text-ds-s font-bold text-brand-dark">
          Admin Hub
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          className="grid size-11 place-items-center rounded-lg text-brand-link transition-colors hover:bg-secondary/60"
        >
          <IconMenu className="size-5" />
        </button>
      </header>

      {open ? (
        <div className="md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-foreground/25"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            className="scroll-fade-y scrollbar-hide fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r-2 border-border bg-card px-4 py-6"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 grid size-11 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              <X className="size-5" strokeWidth={2} />
            </button>
            {content}
          </div>
        </div>
      ) : null}

      {/* Desktop: the familiar sticky sidebar. */}
      <aside className="scroll-fade-y scrollbar-hide sticky top-0 hidden h-dvh w-60 shrink-0 flex-col overflow-y-auto border-r-2 border-border bg-card px-4 py-6 md:flex">
        {content}
      </aside>
    </>
  );
}
