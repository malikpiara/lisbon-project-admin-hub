import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { authedPayload } from "@/lib/admin-auth";

// Shell for the Payload-backed admin: gates the whole group on Payload auth
// (same session cookie as /cms-admin) and frames it with the DS sidebar.
export default async function AdminLayout({ children }) {
  const { user } = await authedPayload();

  return (
    <div className="flex min-h-dvh">
      <AdminSidebar userEmail={user.email} />
      <div className="min-w-0 flex-1 bg-background">{children}</div>
    </div>
  );
}
