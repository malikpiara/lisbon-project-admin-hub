"use server";

import { revalidatePath } from "next/cache";

import { logAudit } from "@/lib/audit-log";
import { authedPayload } from "@/lib/admin-auth";
import { validateSiteText } from "@/lib/site-text-defaults";
import { revalidatePublicContent } from "@/lib/revalidate-public";

// Same review flow as articles (see articles/actions.js saveTopic): admins
// publish directly; editors save a DRAFT ("submit for review") that leaves the
// live site untouched until an admin approves it at /admin/review.
export async function saveSiteText(data) {
  const { payload, user } = await authedPayload();
  const isAdmin = user.role === "admin";

  // Only the declared fields, validated — never let the client set _status or
  // audit fields.
  const checked = validateSiteText(data);
  if (!checked.ok) return checked;

  await payload.updateGlobal({
    slug: "site-text",
    data: {
      ...checked.data,
      updatedBy: user.id,
      _status: isAdmin ? "published" : "draft",
    },
    draft: !isAdmin,
  });
  await logAudit(payload, {
    action: isAdmin ? "updated" : "submitted",
    collectionSlug: "site-text",
    docId: "site-text",
    docTitle: "Site text",
    userId: user.id,
  });
  revalidatePath("/admin/site-text");
  revalidatePath("/admin/review");
  if (isAdmin) revalidatePublicContent(); // a draft changes nothing public
  return { ok: true };
}
