// Structured "who/when" audit data for a Payload doc. Returns the date and the
// person separately so the UI can apply hierarchy (de-emphasised label, strong
// value, secondary person). `createdBy`/`updatedBy` must be populated (fetch the
// doc with depth >= 1); `by` is null for seed records that predate audit fields.

function fmtDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function whoName(user) {
  if (!user || typeof user !== "object") return null;
  return user.name || user.email || null;
}

function part(date, user) {
  const at = fmtDate(date);
  if (!at) return null;
  return { at, by: whoName(user) };
}

export function auditLabels(doc) {
  return {
    modified: part(doc?.updatedAt, doc?.updatedBy),
    created: part(doc?.createdAt, doc?.createdBy),
  };
}
