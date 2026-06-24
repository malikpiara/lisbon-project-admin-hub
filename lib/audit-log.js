// Write one activity-log entry per content change. Best-effort: a logging
// failure must never break the actual create/update/delete, so it's wrapped and
// swallowed (with a server-side console note).
export async function logAudit(
  payload,
  { action, collectionSlug, docId, docTitle, userId }
) {
  try {
    await payload.create({
      collection: "audit-log",
      data: {
        action,
        collectionSlug,
        docId: docId != null ? String(docId) : undefined,
        docTitle: docTitle ?? "",
        user: userId,
      },
    });
  } catch (err) {
    console.error("[audit-log] failed to record activity:", err);
  }
}
