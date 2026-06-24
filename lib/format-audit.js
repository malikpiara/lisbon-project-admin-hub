// Build "Created … by … / Last modified … by …" labels from a Payload doc.
// Format on the server (avoids date hydration mismatches); `createdBy`/`updatedBy`
// must be populated (fetch the doc with depth >= 1). `by …` is omitted when the
// user is unknown — e.g. seed records created before audit fields existed.

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

function label(date, user) {
  const when = fmtDate(date);
  if (!when) return null;
  const who = whoName(user);
  return who ? `${when} by ${who}` : when;
}

export function auditLabels(doc) {
  return {
    created: label(doc?.createdAt, doc?.createdBy),
    modified: label(doc?.updatedAt, doc?.updatedBy),
  };
}
