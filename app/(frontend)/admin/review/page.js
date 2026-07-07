import { redirect } from "next/navigation";

import { authedPayload } from "@/lib/admin-auth";
import { diffWords } from "@/lib/diff-text";
import { flattenTopic } from "@/lib/flatten-topic";
import { ReviewQueue } from "./review-queue";

export const metadata = {
  title: "Review · Admin",
};

export default async function AdminReviewPage() {
  const { payload, user } = await authedPayload();
  // Reviewing is publishing; editors can't approve their own work.
  if (user.role !== "admin") redirect("/admin");

  // Pending = the newest version of a doc is a draft. depth: 1 populates the
  // submitter on version.updatedBy.
  const { docs: pending } = await payload.findVersions({
    collection: "topics",
    where: {
      latest: { equals: true },
      "version._status": { equals: "draft" },
    },
    sort: "-updatedAt",
    limit: 50,
    depth: 1,
  });

  // The word diff is computed here, server-side: the client gets ready-to-render
  // ops, not two copies of every article.
  const entries = await Promise.all(
    pending.map(async (v) => {
      const topicId = typeof v.parent === "object" ? v.parent?.id : v.parent;
      const published = await payload
        .findByID({ collection: "topics", id: topicId, depth: 0, draft: false })
        .catch(() => null);
      const by = v.version?.updatedBy;
      return {
        id: String(topicId),
        title: v.version?.title || published?.title || "Untitled",
        who:
          (by && typeof by === "object" ? by.name || by.email : null) ||
          "Unknown",
        at: v.updatedAt
          ? new Date(v.updatedAt).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "",
        ops: diffWords(
          published ? flattenTopic(published) : "",
          flattenTopic(v.version)
        ),
      };
    })
  );

  return <ReviewQueue entries={entries} />;
}
