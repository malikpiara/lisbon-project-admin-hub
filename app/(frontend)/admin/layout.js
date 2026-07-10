import { ViewTransition } from "react";
import { cookies } from "next/headers";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { authedPayload } from "@/lib/admin-auth";

// A passthrough title template ("%s") stops the root layout's public brand
// suffix from leaking into staff-facing tab titles, and robots keeps the whole
// auth-gated admin subtree out of search indexes (belt-and-suspenders with
// robots.ts, which already disallows /admin).
export const metadata = {
  title: { template: "%s", default: "Admin Hub" },
  robots: { index: false, follow: false },
};

// Shell for the Payload-backed admin: gates the whole group on Payload auth
// (same session cookie as /cms-admin) and frames it with the DS sidebar.
export default async function AdminLayout({ children }) {
  const { payload, user } = await authedPayload();

  // Badge count for the Review nav item — pending drafts an admin should act
  // on. One indexed count per request; editors skip it (they can't review).
  let pendingReviews = 0;
  if (user.role === "admin") {
    const counted = await payload
      .countVersions({
        collection: "topics",
        where: {
          latest: { equals: true },
          "version._status": { equals: "draft" },
        },
      })
      .catch(() => null);
    pendingReviews = counted?.totalDocs ?? 0;
  }

  // Persist the collapsed/expanded choice across reloads: the Sidebar writes a
  // `sidebar_state` cookie client-side, and reading it here lets the server
  // render the same state (no flash). Absent cookie = expanded.
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

  return (
    // TooltipProvider groups the icon-button + collapsed-nav tooltips so hovering
    // between them skips the reopen delay (150ms). The Sidebar handles the
    // desktop rail collapse (⌘B) and the mobile drawer (its own Sheet).
    <TooltipProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AdminSidebar
          userEmail={user.email}
          isAdmin={user.role === "admin"}
          pendingReviews={pendingReviews}
        />
        <SidebarInset className="bg-card">
          {/* Mobile gets a slim bar with the menu trigger; on desktop the
              sidebar collapses via its rail or ⌘B, so no top chrome is needed. */}
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b-2 border-border bg-card px-3 md:hidden">
            <SidebarTrigger />
            <span className="font-heading text-ds-s font-bold text-brand-dark">
              Admin Hub
            </span>
          </header>
          {/* Cross-fade the content pane on route change. The <ViewTransition>
              boundary persists while its children swap per route, so React
              animates old↔new; the sidebar sits outside it and stays put. Timing +
              reduced-motion live in globals.css (::view-transition-*). */}
          <ViewTransition>{children}</ViewTransition>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
