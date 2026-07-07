"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { logAudit } from "@/lib/audit-log";
import { authedPayload } from "@/lib/admin-auth";
import { revalidatePublicContent } from "@/lib/revalidate-public";

// Saves the whole topic doc, including the embedded `article` group (sections +
// FAQs) and the `service` relationship. `data` is already mapped to Payload's
// shape by the editor; tone/slug are left untouched. Reassigning the service
// moves the topic: we append it to the destination service and revalidate both
// service pages (its public URL changes with the service). Stamp the editor as
// the last modifier (the Local API doesn't infer the user).
//
// Role-aware since the review flow: admins publish directly; editors save a
// DRAFT version ("submit for review") that leaves the published article
// untouched until an admin approves it at /admin/review.
export async function saveTopic(id, data) {
  const { payload, user } = await authedPayload();
  const isAdmin = user.role === "admin";

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
  if (moved) {
    // Land it at the end of the destination service's list.
    const dest = await payload.count({
      collection: "topics",
      where: { service: { equals: nextServiceId } },
    });
    patch.order = dest.totalDocs;
  }

  patch._status = isAdmin ? "published" : "draft";
  await payload.update({
    collection: "topics",
    id,
    data: patch,
    draft: !isAdmin,
  });
  await logAudit(payload, {
    action: isAdmin ? "updated" : "submitted",
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
  revalidatePublicContent(); // the article page + its parent category page
}

export async function createTopic(serviceId) {
  const { payload, user } = await authedPayload();
  const existing = await payload.count({
    collection: "topics",
    where: { service: { equals: serviceId } },
  });
  // The stub publishes for every role — an empty shell is harmless, and it
  // guarantees a published baseline exists for the review flow to diff and
  // fall back to. Content edits are what go through review.
  const created = await payload.create({
    collection: "topics",
    data: {
      title: "New article",
      slug: `new-topic-${existing.totalDocs + 1}`,
      service: serviceId,
      order: existing.totalDocs,
      createdBy: user.id,
      updatedBy: user.id,
      _status: "published",
    },
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
  revalidatePublicContent();
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
  redirect(serviceId ? `/admin/services/${serviceId}` : "/admin/services");
}
