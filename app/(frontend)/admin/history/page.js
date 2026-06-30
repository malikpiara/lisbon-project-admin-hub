import { authedPayload } from "@/lib/admin-auth";
import { HistoryFeed } from "./history-feed";

export const metadata = {
  title: "History · Admin",
};

export default async function AdminHistoryPage() {
  const { payload } = await authedPayload();

  const { docs } = await payload.find({
    collection: "audit-log",
    sort: "-createdAt",
    limit: 200,
    depth: 1, // populate the user relationship
  });

  const entries = docs.map((d) => ({
    id: d.id,
    action: d.action,
    collectionSlug: d.collectionSlug,
    docId: d.docId ?? null,
    docTitle: d.docTitle || "Untitled",
    who:
      (d.user && typeof d.user === "object"
        ? d.user.name || d.user.email
        : null) || "Unknown",
    atLabel: d.createdAt
      ? new Date(d.createdAt).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "",
  }));

  return <HistoryFeed entries={entries} />;
}
