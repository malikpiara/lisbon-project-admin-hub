import { AdminSidebar } from "@/components/admin/admin-sidebar";

// Same shell as /admin — the shared team-workspace sidebar. Auth is enforced on
// the page itself (Payload session), so the layout stays a thin wrapper.
export default function InsightsLayout({ children }) {
  return (
    <div className="flex min-h-dvh">
      <AdminSidebar />
      <div className="flex-1 bg-background">{children}</div>
    </div>
  );
}
