import { authedPayload } from "@/lib/admin-auth";
import { QuickAccessEditor } from "./quick-access-editor";

export const metadata = {
  title: "Quick Access · Admin",
};

// The Payload-backed Quick Access editor. Data is READ here from Payload's Local
// API (Postgres) and WRITTEN via server actions — not the localStorage store that
// still powers the public site. Gated by Payload auth, same as /insights.
export default async function AdminQuickAccessPage() {
  const { payload, user } = await authedPayload();

  const { docs } = await payload.find({
    collection: "quick-access",
    sort: "order",
    limit: 100,
    depth: 0,
  });

  return <QuickAccessEditor initialItems={docs} userEmail={user.email} />;
}
