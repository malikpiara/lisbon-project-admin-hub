"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { logAudit } from "@/lib/audit-log";
import { authedPayload } from "@/lib/admin-auth";
import { revalidatePublicContent } from "@/lib/revalidate-public";
import { DEFAULT_FAQ_SUBHEADING } from "@/lib/article-defaults";
import { slugify, uniqueSlug } from "@/lib/slugify";
import { STUB_TITLE, articleCompleteness } from "@/lib/article-completeness";

// Saves the whole topic doc, including the embedded `article` group (sections +
// FAQs) and the `service` relationship. `data` is already mapped to Payload's
// shape by the editor; tone/slug are left untouched. Reassigning the service
// moves the topic: we append it to the destination service and revalidate both
// service pages (its public URL changes with the service). Stamp the editor as
// the last modifier (the Local API doesn't infer the user).
//
// Explicit publishing (October 2026): the caller says what it wants —
//   "draft"    save privately; the live page and the review queue are untouched
//   "submit"   save and ask for review (editors); appears in /admin/review
//   "publish"  go live (admins) — only if the article is complete
//              (lib/article-completeness.js); otherwise it is saved as a draft
//              and the result says what is missing, so no work is lost.
// Save used to mean a different thing per role with nothing on screen saying
// which; the verbs now live on the buttons, and this returns what happened.
export async function saveTopic(id, data, { intent } = {}) {
  const { payload, user } = await authedPayload();
  const isAdmin = user.role === "admin";
  const want = intent ?? (isAdmin ? "publish" : "submit");
  if (want === "publish" && !isAdmin) {
    return { ok: false, status: "draft", error: "Only admins can publish." };
  }

  const prev = await payload
    .findByID({ collection: "topics", id, depth: 0 })
    .catch(() => null);
  const prevServiceId = prev?.service
    ? typeof prev.service === "object"
      ? prev.service.id
      : prev.service
    : null;
  const nextServiceId = data.service ?? prevServiceId;
  const moved =
    prevServiceId &&
    nextServiceId &&
    String(prevServiceId) !== String(nextServiceId);

  const patch = { ...data, updatedBy: user.id };
  // Keep the slug (the public URL segment) in step with the title. The editor
  // has no slug field, so the title is the only source of truth. Unique within
  // the destination service, since two services can each have a "documents"
  // article. NOTE: renaming an article changes its public URL — an accepted
  // trade-off for keeping slugs readable pre-release.
  if (typeof data.title === "string" && data.title.trim()) {
    patch.slug = await uniqueSlug(payload, "topics", slugify(data.title), id, {
      service: { equals: nextServiceId },
    });
  }
  if (moved) {
    // Land it at the end of the destination service's list.
    const dest = await payload.count({
      collection: "topics",
      where: { service: { equals: nextServiceId } },
    });
    patch.order = dest.totalDocs;
  }

  const { complete, missing } = articleCompleteness(patch);
  const publishing = want === "publish" && complete;
  patch._status = publishing ? "published" : "draft";
  if (publishing) patch.reviewRequested = false;
  else if (want === "submit") patch.reviewRequested = true;
  // "draft" leaves reviewRequested as stored: an editor refining a submission
  // is still waiting for review.
  await payload.update({
    collection: "topics",
    id,
    data: patch,
    draft: !publishing,
  });
  await logAudit(payload, {
    action: publishing ? "published" : want === "submit" ? "submitted" : "updated",
    collectionSlug: "topics",
    docId: id,
    docTitle: data.title,
    userId: user.id,
  });
  revalidatePath("/admin/review");
  revalidatePath(`/admin/articles/${id}`);
  revalidatePath("/admin/articles");
  if (moved) {
    revalidatePath(`/admin/services/${prevServiceId}`);
    revalidatePath(`/admin/services/${nextServiceId}`);
  }
  // Drafts change nothing public; publishing refreshes the article page and
  // its category page.
  if (publishing) revalidatePublicContent();
  return {
    ok: true,
    status: patch._status,
    published: publishing,
    submitted: want === "submit",
    // Filled when a publish was asked for but the article is not complete.
    refused: want === "publish" && !complete,
    missing,
  };
}

// Take an article off the live site. Payload keeps every version, so this is
// reversible: Publish puts it back. The main document's status flips to draft,
// which is what the public adapter filters on.
export async function unpublishTopic(id) {
  const { payload, user } = await authedPayload();
  if (user.role !== "admin") return { ok: false, error: "Only admins can unpublish." };
  const doc = await payload
    .findByID({ collection: "topics", id, depth: 0, draft: true })
    .catch(() => null);
  if (!doc) return { ok: false, error: "Article not found." };
  await payload.update({
    collection: "topics",
    id,
    data: { _status: "draft", reviewRequested: false, updatedBy: user.id },
    draft: false,
  });
  await logAudit(payload, {
    action: "unpublished",
    collectionSlug: "topics",
    docId: id,
    docTitle: doc.title,
    userId: user.id,
  });
  revalidatePath("/admin/review");
  revalidatePath(`/admin/articles/${id}`);
  revalidatePath("/admin/articles");
  revalidatePublicContent();
  return { ok: true };
}

export async function createTopic(serviceId) {
  const { payload, user } = await authedPayload();
  const existing = await payload.count({
    collection: "topics",
    where: { service: { equals: serviceId } },
  });
  // A new article starts as a DRAFT. It used to publish at once "as a baseline
  // for review", which put an empty "New article" card on the live category
  // page every time anyone clicked Add (nine were deleted by hand on
  // 2026-10-02). The public adapter reads published only, the review queue
  // only sees submitted drafts, and the slug is unique so two stubs can't
  // shadow each other.
  const created = await payload.create({
    collection: "topics",
    data: {
      title: STUB_TITLE,
      slug: await uniqueSlug(payload, "topics", "new-article", null, {
        service: { equals: serviceId },
      }),
      service: serviceId,
      order: existing.totalDocs,
      // Prewrite the FAQ subheading so editors start from a sensible line.
      article: { faqLead: DEFAULT_FAQ_SUBHEADING },
      createdBy: user.id,
      updatedBy: user.id,
      reviewRequested: false,
      _status: "draft",
    },
    draft: true,
  });
  await logAudit(payload, {
    action: "created",
    collectionSlug: "topics",
    docId: created.id,
    docTitle: created.title,
    userId: user.id,
  });
  revalidatePath(`/admin/services/${serviceId}`);
  revalidatePath("/admin/articles");
  redirect(`/admin/articles/${created.id}`);
}

// Persist a new order for a service's topics (order = position on the page).
export async function reorderTopics(ids, serviceId) {
  const { payload } = await authedPayload();
  await Promise.all(
    ids.map((id, index) =>
      payload.update({ collection: "topics", id, data: { order: index } })
    )
  );
  if (serviceId) revalidatePath(`/admin/services/${serviceId}`);
  revalidatePath("/admin/articles");
  revalidatePublicContent();
}

export async function deleteTopic(id, serviceId) {
  const { payload, user } = await authedPayload();
  const doc = await payload
    .findByID({ collection: "topics", id, depth: 0 })
    .catch(() => null);
  await payload.delete({ collection: "topics", id });
  await logAudit(payload, {
    action: "deleted",
    collectionSlug: "topics",
    docId: id,
    docTitle: doc?.title,
    userId: user.id,
  });
  revalidatePath("/admin/services");
  revalidatePath("/admin/articles");
  revalidatePublicContent();
  // Land back in the full Articles list, not inside the service the article
  // belonged to — the article is gone, and the list is where you pick what to
  // do next. (`serviceId` is still used above for revalidation.)
  redirect("/admin/articles");
}
