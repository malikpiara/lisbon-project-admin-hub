"use server";

import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";

import { logAudit } from "@/lib/audit-log";

// Tracer-bullet WRITE path. The Studio editor reaches Payload's Local API
// (Postgres on Supabase) through these server actions, instead of the
// localStorage store the /admin prototype uses. Each action re-checks auth
// (defense in depth — the page already gates) and revalidates the affected
// routes so the next read reflects the change.
async function authedPayload() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user) redirect("/cms-admin/login");
  return { payload, user };
}

export async function saveQuickAccessItem(id, data) {
  const { payload, user } = await authedPayload();
  await payload.update({
    collection: "quick-access",
    id,
    data: { ...data, updatedBy: user.id },
  });
  await logAudit(payload, {
    action: "updated",
    collectionSlug: "quick-access",
    docId: id,
    docTitle: data.title,
    userId: user.id,
  });
  revalidatePath("/studio/quick-access");
  revalidatePath("/"); // home hero — becomes live once the public site reads Payload
}

export async function createQuickAccessItem() {
  const { payload, user } = await authedPayload();
  // Append after the existing cards.
  const existing = await payload.find({
    collection: "quick-access",
    limit: 0,
    depth: 0,
  });
  const created = await payload.create({
    collection: "quick-access",
    data: {
      title: "New card",
      href: "/",
      description: "",
      external: false,
      order: existing.totalDocs,
      createdBy: user.id,
      updatedBy: user.id,
    },
  });
  await logAudit(payload, {
    action: "created",
    collectionSlug: "quick-access",
    docId: created.id,
    docTitle: created.title,
    userId: user.id,
  });
  revalidatePath("/studio/quick-access");
  return created.id;
}

export async function deleteQuickAccessItem(id) {
  const { payload, user } = await authedPayload();
  const doc = await payload
    .findByID({ collection: "quick-access", id, depth: 0 })
    .catch(() => null);
  await payload.delete({ collection: "quick-access", id });
  await logAudit(payload, {
    action: "deleted",
    collectionSlug: "quick-access",
    docId: id,
    docTitle: doc?.title,
    userId: user.id,
  });
  revalidatePath("/studio/quick-access");
  revalidatePath("/");
}
