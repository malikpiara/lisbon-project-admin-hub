"use server";

import { revalidatePath } from "next/cache";

import { logAudit } from "@/lib/audit-log";
import { authedPayload } from "@/lib/admin-auth";
import { validateSiteText, withSiteTextDefaults } from "@/lib/site-text-defaults";
import { revalidatePublicContent } from "@/lib/revalidate-public";

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

// ---- Site text (the `site-text` global) -----------------------------------

function revalidateSiteText() {
  revalidatePath("/admin/review");
  revalidatePath("/admin/site-text");
  revalidatePublicContent();
}

// Publish the pending draft. Like approveDraft: updateGlobal merges onto the
// LATEST version (getLatestGlobalVersion in payload's globals/operations/
// update.js), so flipping _status publishes the submitted copy.
export async function approveSiteText() {
  const { payload, user } = await authedPayload();
  if (user.role !== "admin") return notAllowed;
  try {
    await payload.updateGlobal({
      slug: "site-text",
      data: { _status: "published", updatedBy: user.id },
      draft: false,
    });
    await logAudit(payload, {
      action: "approved",
      collectionSlug: "site-text",
      docId: "site-text",
      docTitle: "Site text",
      userId: user.id,
    });
    revalidateSiteText();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not approve this change." };
  }
}

// Keep the live copy: re-publish what's currently published so it becomes the
// newest version and supersedes the draft (which stays in version history).
// Never published yet → the live page shows the defaults, so publish those.
export async function declineSiteText() {
  const { payload, user } = await authedPayload();
  if (user.role !== "admin") return notAllowed;
  try {
    const pub = await payload
      .findGlobal({ slug: "site-text", depth: 0, draft: false })
      .catch(() => null);
    const checked = validateSiteText(withSiteTextDefaults(pub));
    if (!checked.ok) throw new Error(checked.error);
    const data = checked.data;
    await payload.updateGlobal({
      slug: "site-text",
      data: { ...data, _status: "published", updatedBy: user.id },
      draft: false,
    });
    await logAudit(payload, {
      action: "declined",
      collectionSlug: "site-text",
      docId: "site-text",
      docTitle: "Site text",
      userId: user.id,
    });
    revalidateSiteText();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || "Could not decline this change." };
  }
}
