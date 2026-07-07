import { ViewTransition } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
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

  return (
    // Block flow on mobile (header bar stacks above the content), classic
    // sidebar row from md up.
    <div className="min-h-dvh md:flex">
      <AdminSidebar
        userEmail={user.email}
        isAdmin={user.role === "admin"}
        pendingReviews={pendingReviews}
      />
      <div className="min-w-0 flex-1 bg-card">
        {/* Cross-fade the content pane on route change. The <ViewTransition>
            boundary persists while its children swap per route, so React
            animates old↔new; the sidebar sits outside it and stays put. Timing +
            reduced-motion live in globals.css (::view-transition-*). */}
        <ViewTransition>{children}</ViewTransition>
      </div>
    </div>
  );
}
