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

  // Day labels for grouping the feed. Computed in the server's local timezone so
  // "Today"/"Yesterday" line up with the times shown on each row. Entries arrive
  // already sorted newest-first, so the feed can group by consecutive dayLabel.
  const now = new Date();
  const dayKey = (dt) => dt.toLocaleDateString("en-CA"); // YYYY-MM-DD, local TZ
  const todayKey = dayKey(now);
  const yesterdayKey = dayKey(new Date(now.getTime() - 86_400_000));
  const dayLabelOf = (dt) => {
    const k = dayKey(dt);
    if (k === todayKey) return "Today";
    if (k === yesterdayKey) return "Yesterday";
    return dt.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const entries = docs.map((d) => {
    const dt = d.createdAt ? new Date(d.createdAt) : null;
    return {
      id: d.id,
      action: d.action,
      collectionSlug: d.collectionSlug,
      docId: d.docId ?? null,
      docTitle: d.docTitle || "Untitled",
      who:
        (d.user && typeof d.user === "object"
          ? d.user.name || d.user.email
          : null) || "Unknown",
      dayLabel: dt ? dayLabelOf(dt) : "",
      // Row shows the time; the day lives in the group header. Full date kept for
      // the hover title.
      timeLabel: dt
        ? dt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
        : "",
      atLabel: dt
        ? dt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
        : "",
    };
  });

  return <HistoryFeed entries={entries} />;
}
