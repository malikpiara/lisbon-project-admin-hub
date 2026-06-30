"use server";

import { revalidatePath } from "next/cache";

import { logAudit } from "@/lib/audit-log";
import { authedPayload } from "@/lib/admin-auth";

// Create a volunteer account. Payload hashes the password. Returns a result
// object so the form can surface validation errors (duplicate email, etc.).
export async function createUser({ name, email, password }) {
  const { payload, user } = await authedPayload();
  try {
    const created = await payload.create({
      collection: "users",
      data: { name, email, password },
    });
    await logAudit(payload, {
      action: "created",
      collectionSlug: "users",
      docId: created.id,
      docTitle: name || email,
      userId: user.id,
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not add this person." };
  }
}

export async function setUserPassword(id, password) {
  const { payload, user } = await authedPayload();
  try {
    const updated = await payload.update({
      collection: "users",
      id,
      data: { password },
    });
    await logAudit(payload, {
      action: "updated",
      collectionSlug: "users",
      docId: id,
      docTitle: updated.name || updated.email,
      userId: user.id,
    });
    revalidatePath("/admin/users");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not reset the password." };
  }
}

export async function deleteUser(id) {
  const { payload, user } = await authedPayload();
  // Never let someone lock themselves out.
  if (String(id) === String(user.id)) {
    return { ok: false, error: "You can't remove your own account." };
  }
  const doc = await payload
    .findByID({ collection: "users", id, depth: 0 })
    .catch(() => null);
  await payload.delete({ collection: "users", id });
  await logAudit(payload, {
    action: "deleted",
    collectionSlug: "users",
    docId: id,
    docTitle: doc?.name || doc?.email,
    userId: user.id,
  });
  revalidatePath("/admin/users");
  return { ok: true };
}
