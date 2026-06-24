import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import { QuickAccessEditor } from "./quick-access-editor";

export const metadata = {
  title: "Quick Access · Studio (Payload)",
};

// Studio = the Payload-backed twin of the /admin prototype. Same DS UI, but the
// data is READ here from Payload's Local API (Postgres) and WRITTEN via server
// actions — not the localStorage store. Kept at its own route so /admin stays
// available for side-by-side comparison. Gated by Payload auth, same as /insights.
export default async function StudioQuickAccessPage() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user) {
    redirect("/cms-admin/login");
  }

  const { docs } = await payload.find({
    collection: "quick-access",
    sort: "order",
    limit: 100,
    depth: 0,
  });

  return <QuickAccessEditor initialItems={docs} userEmail={user.email} />;
}
