"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { logAudit } from "@/lib/audit-log";
import { authedPayload } from "@/lib/admin-auth";
import { revalidatePublicContent } from "@/lib/revalidate-public";

// Saves the service doc (basics + intro + contacts-page header). `data` is
// already mapped to Payload's shape by the editor; fields we don't send (slug,
// tone, order) are left untouched by Payload's partial update. Contacts live in
// their own collection now, edited at /admin/contacts. Stamp the last modifier.
export async function saveService(id, data) {
  const { payload, user } = await authedPayload();
  await payload.update({
    collection: "services",
    id,
    data: { ...data, updatedBy: user.id },
  });
  await logAudit(payload, {
    action: "updated",
    collectionSlug: "services",
    docId: id,
    docTitle: data.title,
    userId: user.id,
  });
  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${id}`);
  revalidatePublicContent(); // home grid, All Contacts categories, service page
}

export async function createService() {
  const { payload, user } = await authedPayload();
  const existing = await payload.find({
    collection: "services",
    limit: 0,
    depth: 0,
  });
  const created = await payload.create({
    collection: "services",
    data: {
      title: "New category",
      slug: `new-category-${existing.totalDocs + 1}`,
      order: existing.totalDocs,
      createdBy: user.id,
      updatedBy: user.id,
    },
  });
  await logAudit(payload, {
    action: "created",
    collectionSlug: "services",
    docId: created.id,
    docTitle: created.title,
    userId: user.id,
  });
  revalidatePath("/admin/services");
  revalidatePublicContent();
  redirect(`/admin/services/${created.id}`);
}

// Persist a new display order (order = position in the home grid).
export async function reorderServices(ids) {
  const { payload } = await authedPayload();
  await Promise.all(
    ids.map((id, index) =>
      payload.update({ collection: "services", id, data: { order: index } })
    )
  );
  revalidatePath("/admin/services");
  revalidatePublicContent();
}

// PROTOTYPE (#2): restore a past version as the current document.
export async function restoreServiceVersion(versionId, serviceId) {
  const { payload, user } = await authedPayload();
  const restored = await payload.restoreVersion({
    collection: "services",
    id: versionId,
    user,
  });
  await logAudit(payload, {
    action: "updated",
    collectionSlug: "services",
    docId: serviceId,
    docTitle: restored?.title,
    userId: user.id,
  });
  revalidatePath("/admin/services");
  revalidatePath(`/admin/services/${serviceId}`);
  revalidatePublicContent();
}

export async function deleteService(id) {
  const { payload, user } = await authedPayload();
  const doc = await payload
    .findByID({ collection: "services", id, depth: 0 })
    .catch(() => null);
  await payload.delete({ collection: "services", id });
  await logAudit(payload, {
    action: "deleted",
    collectionSlug: "services",
    docId: id,
    docTitle: doc?.title,
    userId: user.id,
  });
  revalidatePath("/admin/services");
  revalidatePublicContent();
  redirect("/admin/services");
}
