// Field-level diff between two Payload version snapshots. Returns a list of
// human-readable changes ("what this save changed"), or null when there is no
// previous snapshot to compare against (the oldest tracked version).

// Strip Payload's internal array-row `id`s and sort keys so two snapshots
// compare on content, not on incidental row identity.
function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    const out = {};
    for (const key of Object.keys(value).sort()) {
      if (key === "id") continue;
      out[key] = normalize(value[key]);
    }
    return out;
  }
  return value;
}

function deepEqual(a, b) {
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
}

export function diffSnapshots(prev, next, fields) {
  if (!prev) return null;
  const changes = [];
  for (const f of fields) {
    const a = prev?.[f.key];
    const b = next?.[f.key];
    if (f.type === "array") {
      const al = Array.isArray(a) ? a.length : 0;
      const bl = Array.isArray(b) ? b.length : 0;
      if (al !== bl) {
        changes.push({
          label: f.label,
          from: `${al} item${al === 1 ? "" : "s"}`,
          to: `${bl} item${bl === 1 ? "" : "s"}`,
        });
      } else if (!deepEqual(a, b)) {
        changes.push({ label: f.label, from: null, to: "edited" });
      }
    } else {
      const av = (a ?? "").toString();
      const bv = (b ?? "").toString();
      if (av !== bv) {
        changes.push({ label: f.label, from: av, to: bv });
      }
    }
  }
  return changes;
}
