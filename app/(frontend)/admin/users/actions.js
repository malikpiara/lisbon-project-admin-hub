"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { logAudit } from "@/lib/audit-log";
import { authedPayload } from "@/lib/admin-auth";
import { SITE_URL } from "@/lib/site";

// These actions run on Payload's Local API, which bypasses collection access
// rules — so the role checks the Users collection declares for the REST API
// are re-enforced here explicitly. Rule of thumb: admins manage the team;
// the only thing a non-admin can do is change their own password.
const notAllowed = { ok: false, error: "Only admins can manage the team." };

// Passwords never travel between people here. Adding someone (or resetting
// them) produces a single-use link built on Payload's forgot-password token;
// the person opens it and chooses their own password on /welcome. Invites get
// a week (people don't check WhatsApp daily); reset links are shorter because
// the account already has a working password and the link alone grants access.
const INVITE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_EXPIRATION_MS = 3 * 24 * 60 * 60 * 1000;

// Links must work wherever the admin is browsing (localhost, preview deploys,
// production), so derive the origin from the request instead of hardcoding
// the canonical host. SITE_URL is the fallback when no Host header exists.
async function requestOrigin() {
  const h = await headers();
  const host = h.get("host");
  if (!host) return SITE_URL;
  const proto =
    h.get("x-forwarded-proto") ??
    (/^(localhost|127\.)/.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}

async function buildPasswordLink(payload, email, { invite }) {
  const token = await payload.forgotPassword({
    collection: "users",
    data: { email },
    disableEmail: true,
    expiration: invite ? INVITE_EXPIRATION_MS : RESET_EXPIRATION_MS,
  });
  if (!token) return null;
  const origin = await requestOrigin();
  return `${origin}/welcome?token=${token}${invite ? "&new=1" : ""}`;
}

// Surfaced when Payload rejects the create — the only realistic validation
// failure is a duplicate email, so translate that one into plain language.
function friendlyCreateError(err) {
  const msg = err?.message || "";
  if (/email/i.test(msg) && /(unique|already|registered|invalid)/i.test(msg)) {
    return "Someone with this email is already on the team.";
  }
  return msg || "Could not add this person.";
}

// Create a team account. No password is asked for or shown: the account gets
// an unguessable throwaway (never displayed, immediately superseded), and the
// admin receives a one-time invite link to pass on. Returns { link } so the
// form can show the copyable invite.
export async function createUser({ name, email, role }) {
  const { payload, user } = await authedPayload();
  if (user.role !== "admin") return notAllowed;
  try {
    const created = await payload.create({
      collection: "users",
      data: {
        name,
        email,
        password: randomBytes(32).toString("base64url"),
        role: role === "admin" ? "admin" : "editor",
      },
    });
    const link = await buildPasswordLink(payload, created.email, {
      invite: true,
    });
    await logAudit(payload, {
      action: "created",
      collectionSlug: "users",
      docId: created.id,
      docTitle: name || email,
      userId: user.id,
    });
    revalidatePath("/admin/users");
    return { ok: true, link, name: created.name || created.email };
  } catch (err) {
    return { ok: false, error: friendlyCreateError(err) };
  }
}

// A fresh single-use link for an existing account. The server picks the kind:
// someone who never joined gets a new invite (7 days); a member who's locked
// out gets a reset link (3 days) — their current password keeps working until
// they use it. Minting a link supersedes any earlier one for that person.
export async function createPasswordLink(id) {
  const { payload, user } = await authedPayload();
  if (user.role !== "admin") return notAllowed;
  try {
    const target = await payload.findByID({
      collection: "users",
      id,
      depth: 0,
    });
    const invite = !target.joinedAt;
    const link = await buildPasswordLink(payload, target.email, { invite });
    if (!link) return { ok: false, error: "Could not create the link." };
    await logAudit(payload, {
      action: "updated",
      collectionSlug: "users",
      docId: id,
      docTitle: target.name || target.email,
      userId: user.id,
    });
    return {
      ok: true,
      link,
      kind: invite ? "invite" : "reset",
      name: target.name || target.email,
    };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not create the link." };
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

// Changing your OWN password is the one direct password write left — typing a
// new password for yourself is fine; typing one for someone else is exactly
// the pattern the invite/reset links replace.
export async function setOwnPassword(password) {
  const { payload, user } = await authedPayload();
  if (!password || password.length < 8) {
    return { ok: false, error: "Use at least 8 characters." };
  }
  try {
    await payload.update({
      collection: "users",
      id: user.id,
      data: { password },
    });
    await logAudit(payload, {
      action: "updated",
      collectionSlug: "users",
      docId: user.id,
      docTitle: user.name || user.email,
      userId: user.id,
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not change the password." };
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
