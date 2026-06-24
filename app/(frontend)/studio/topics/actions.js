"use server";

import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";

import { logAudit } from "@/lib/audit-log";

async function authedPayload() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user) redirect("/cms-admin/login");
  return { payload, user };
}

// Saves the whole topic doc, including the embedded `article` group (sections +
// FAQs). `data` is already mapped to Payload's shape by the editor; tone/order/
// slug/service are left untouched by the partial update. Stamp the editor as the
// last modifier (the Local API doesn't infer the user).
export async function saveTopic(id, data) {
  const { payload, user } = await authedPayload();
  await payload.update({
    collection: "topics",
    id,
    data: { ...data, updatedBy: user.id },
  });
  await logAudit(payload, {
    action: "updated",
    collectionSlug: "topics",
    docId: id,
    docTitle: data.title,
    userId: user.id,
  });
  revalidatePath(`/studio/topics/${id}`);
  revalidatePath("/"); // article pages — live once the public site reads Payload
}

export async function createTopic(serviceId) {
  const { payload, user } = await authedPayload();
  const existing = await payload.find({
    collection: "topics",
    where: { service: { equals: serviceId } },
    limit: 0,
    depth: 0,
  });
  const created = await payload.create({
    collection: "topics",
    data: {
      title: "New topic",
      slug: `new-topic-${existing.totalDocs + 1}`,
      service: serviceId,
      order: existing.totalDocs,
      createdBy: user.id,
      updatedBy: user.id,
    },
  });
  await logAudit(payload, {
    action: "created",
    collectionSlug: "topics",
    docId: created.id,
    docTitle: created.title,
    userId: user.id,
  });
  revalidatePath(`/studio/services/${serviceId}`);
  revalidatePath("/studio/topics");
  redirect(`/studio/topics/${created.id}`);
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
  revalidatePath("/studio/services");
  revalidatePath("/studio/topics");
  redirect(serviceId ? `/studio/services/${serviceId}` : "/studio/services");
}
