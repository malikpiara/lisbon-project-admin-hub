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
  const { user } = await authedPayload();

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar userEmail={user.email} isAdmin={user.role === "admin"} />
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
