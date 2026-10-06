import { redirect } from "next/navigation";

import { authedPayload } from "@/lib/admin-auth";
import { diffWords } from "@/lib/diff-text";
import { flattenHomePage } from "@/lib/flatten-home-page";
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
        kind: "topic",
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

  // The home-page global goes through the same flow. At most one pending
  // entry: the latest version, when it's a draft. `.catch` keeps the queue
  // working in a database where the global's tables don't exist yet.
  const { docs: homeDrafts } = await payload
    .findGlobalVersions({
      slug: "home-page",
      where: {
        latest: { equals: true },
        "version._status": { equals: "draft" },
      },
      limit: 1,
      depth: 1,
    })
    .catch(() => ({ docs: [] }));
  for (const v of homeDrafts) {
    const published = await payload
      .findGlobal({ slug: "home-page", depth: 0, draft: false })
      .catch(() => null);
    const by = v.version?.updatedBy;
    entries.push({
      kind: "home-page",
      id: "home-page",
      title: "Home page text",
      who:
        (by && typeof by === "object" ? by.name || by.email : null) ||
        "Unknown",
      at: v.updatedAt
        ? new Date(v.updatedAt).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "",
      // Before the first publish there's no stored copy — the live page shows
      // the shipped defaults, which flattenHomePage(null) reproduces.
      ops: diffWords(flattenHomePage(published), flattenHomePage(v.version)),
    });
  }

  return <ReviewQueue entries={entries} />;
}
