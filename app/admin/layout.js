import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata = {
  title: "Admin · Lisbon Project",
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <div className="flex-1 bg-background">{children}</div>
    </div>
  );
}
