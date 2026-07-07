"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { logAudit } from "@/lib/audit-log";
import { authedPayload } from "@/lib/admin-auth";

// WRITE path for the global contacts directory. Contacts live in their own
// Payload collection now (category == service, many-to-many via `categories`),
// so they're managed here rather than nested under each service. Same auth +
// audit + revalidate discipline as the other admin editors.

export async function saveContact(id, data) {
  const { payload, user } = await authedPayload();
  await payload.update({
    collection: "contacts",
    id,
    data: { ...data, updatedBy: user.id },
  });
  await logAudit(payload, {
    action: "updated",
    collectionSlug: "contacts",
    docId: id,
    docTitle: data.organization,
    userId: user.id,
  });
  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${id}`);
  revalidatePath("/"); // home "All Contacts" — live once the public site reads Payload
}

export async function createContact() {
  const { payload, user } = await authedPayload();
  // `categories` is required (a contact with no category shows nowhere but the
  // full list), so seed the new contact into the first service; the editor lets
  // the author retag it immediately.
  const firstService = await payload.find({
    collection: "services",
    sort: "order",
    limit: 1,
    depth: 0,
  });
  const seededCategory = firstService.docs[0]?.id;
  const created = await payload.create({
    collection: "contacts",
    data: {
      organization: "New contact",
      service: "",
      categories: seededCategory ? [seededCategory] : [],
      createdBy: user.id,
      updatedBy: user.id,
    },
  });
  await logAudit(payload, {
    action: "created",
    collectionSlug: "contacts",
    docId: created.id,
    docTitle: created.organization,
    userId: user.id,
  });
  revalidatePath("/admin/contacts");
  redirect(`/admin/contacts/${created.id}`);
}

export async function deleteContact(id) {
  const { payload, user } = await authedPayload();
  const doc = await payload
    .findByID({ collection: "contacts", id, depth: 0 })
    .catch(() => null);
  await payload.delete({ collection: "contacts", id });
  await logAudit(payload, {
    action: "deleted",
    collectionSlug: "contacts",
    docId: id,
    docTitle: doc?.organization,
    userId: user.id,
  });
  revalidatePath("/admin/contacts");
  revalidatePath("/");
  redirect("/admin/contacts");
}
