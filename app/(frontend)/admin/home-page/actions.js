"use server";

import { revalidatePath } from "next/cache";

import { logAudit } from "@/lib/audit-log";
import { authedPayload } from "@/lib/admin-auth";
import { HOME_PAGE_FIELDS } from "@/lib/home-page-defaults";
import { revalidatePublicContent } from "@/lib/revalidate-public";

// Same review flow as articles (see articles/actions.js saveTopic): admins
// publish directly; editors save a DRAFT ("submit for review") that leaves the
// live home page untouched until an admin approves it at /admin/review.
export async function saveHomePage(data) {
  const { payload, user } = await authedPayload();
  const isAdmin = user.role === "admin";

  // Only the copy fields — never let the client set _status or audit fields.
  const patch = { updatedBy: user.id };
  for (const key of HOME_PAGE_FIELDS) {
    const v = data?.[key];
    if (typeof v !== "string" || !v.trim()) {
      return { ok: false, error: "Every field needs some text." };
    }
    patch[key] = v.trim();
  }

  patch._status = isAdmin ? "published" : "draft";
  await payload.updateGlobal({
    slug: "home-page",
    data: patch,
    draft: !isAdmin,
  });
  await logAudit(payload, {
    action: isAdmin ? "updated" : "submitted",
    collectionSlug: "home-page",
    docId: "home-page",
    docTitle: "Home page",
    userId: user.id,
  });
  revalidatePath("/admin/home-page");
  revalidatePath("/admin/review");
  if (isAdmin) revalidatePublicContent(); // a draft changes nothing public
  return { ok: true };
}
