import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import { StudioSidebar } from "@/components/admin/studio-sidebar";

// Shell for the Payload-backed Studio: gates the whole group on Payload auth
// (same session as /cms-admin and /insights) and frames it with the DS sidebar.
export default async function StudioLayout({ children }) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user) {
    redirect("/cms-admin/login");
  }

  return (
    <div className="flex min-h-dvh">
      <StudioSidebar />
      <div className="min-w-0 flex-1 bg-background">{children}</div>
    </div>
  );
}
