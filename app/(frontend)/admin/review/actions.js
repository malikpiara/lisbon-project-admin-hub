"use server";

import { revalidatePath } from "next/cache";

import { logAudit } from "@/lib/audit-log";
import { authedPayload } from "@/lib/admin-auth";
import { revalidatePublicContent } from "@/lib/revalidate-public";
import { articleCompleteness } from "@/lib/article-completeness";

const notAllowed = { ok: false, error: "Only admins can review changes." };

function revalidateTopic(id) {
  revalidatePath("/admin/review");
  revalidatePath("/admin/articles");
  revalidatePath(`/admin/articles/${id}`);
  // Approving is what makes a draft public, so it must refresh the public
  // article and its category page — not just the home page, which is all this
  // did back when the public site still read from localStorage.
  revalidatePublicContent();
}

// Publish the pending draft. Payload's update merges onto the LATEST version
// (the draft), so flipping _status to published publishes the submitted
// content — verified against updateByID's getLatestCollectionVersion.
export async function approveDraft(id) {
  const { payload, user } = await authedPayload();
  if (user.role !== "admin") return notAllowed;
  try {
    // PROTOTYPE (team feedback): approving publishes, so the same completeness
    // gate as an admin save applies to the submitted draft.
    const latest = await payload.findByID({
      collection: "topics",
      id,
      depth: 0,
      draft: true,
    });
    const { complete, missing } = articleCompleteness(latest);
    if (!complete) {
      return {
        ok: false,
        error: `Not ready to publish — still missing: ${missing.join("; ")}.`,
      };
    }
    const updated = await payload.update({
      collection: "topics",
      id,
      data: { _status: "published", updatedBy: user.id },
      draft: false,
    });
    await logAudit(payload, {
      action: "approved",
      collectionSlug: "topics",
      docId: id,
      docTitle: updated.title,
      userId: user.id,
    });
    revalidateTopic(id);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not approve this change." };
  }
}

// Keep the article as published: re-publish the current published content so
// it becomes the newest version and the draft is superseded. Nothing is
// deleted — the declined draft stays in version history.
export async function declineDraft(id) {
  const { payload, user } = await authedPayload();
  if (user.role !== "admin") return notAllowed;
  try {
    const pub = await payload.findByID({
      collection: "topics",
      id,
      depth: 0,
      draft: false,
    });
    // PROTOTYPE (team feedback): articles now start life as drafts, so a
    // submission can be the FIRST version. There is nothing published to fall
    // back to — re-publishing `pub` here would publish the empty stub. Leave
    // the draft where it is and tell the admin what the options are.
    if (pub?._status !== "published") {
      return {
        ok: false,
        error:
          "This article has never been published, so there is no earlier version to keep. Edit it, ask the editor to revise it, or delete it from Articles.",
      };
    }
    const {
      id: _id,
      createdAt: _c,
      updatedAt: _u,
      createdBy: _cb,
      _status: _s,
      ...data
    } = pub;
    await payload.update({
      collection: "topics",
      id,
      data: { ...data, _status: "published", updatedBy: user.id },
      draft: false,
    });
    await logAudit(payload, {
      action: "declined",
      collectionSlug: "topics",
      docId: id,
      docTitle: pub.title,
      userId: user.id,
    });
    revalidateTopic(id);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not decline this change." };
  }
}
