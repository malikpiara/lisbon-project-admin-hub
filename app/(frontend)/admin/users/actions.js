"use server";

import { revalidatePath } from "next/cache";

import { logAudit } from "@/lib/audit-log";
import { authedPayload } from "@/lib/admin-auth";

// These actions run on Payload's Local API, which bypasses collection access
// rules — so the role checks the Users collection declares for the REST API
// are re-enforced here explicitly. Rule of thumb: admins manage the team;
// the only thing a non-admin can do is reset their own password.
const notAllowed = { ok: false, error: "Only admins can manage the team." };

// Create a volunteer account. Payload hashes the password. Returns a result
// object so the form can surface validation errors (duplicate email, etc.).
export async function createUser({ name, email, password, role }) {
  const { payload, user } = await authedPayload();
  if (user.role !== "admin") return notAllowed;
  try {
    const created = await payload.create({
      collection: "users",
      data: { name, email, password, role: role === "admin" ? "admin" : "editor" },
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

// Name / email / role edits. Role changes are admin-only and never on your own
// account — so the team can't end up with zero admins.
export async function updateUser(id, { name, email, role }) {
  const { payload, user } = await authedPayload();
  if (user.role !== "admin") return notAllowed;
  const isSelf = String(id) === String(user.id);
  if (role !== undefined && isSelf) {
    return { ok: false, error: "You can't change your own role." };
  }
  try {
    const data = { name, email };
    if (role !== undefined) data.role = role === "admin" ? "admin" : "editor";
    const updated = await payload.update({ collection: "users", id, data });
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
    return { ok: false, error: err?.message || "Could not save the changes." };
  }
}

export async function setUserPassword(id, password) {
  const { payload, user } = await authedPayload();
  const isSelf = String(id) === String(user.id);
  if (user.role !== "admin" && !isSelf) return notAllowed;
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
  if (user.role !== "admin") return notAllowed;
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
