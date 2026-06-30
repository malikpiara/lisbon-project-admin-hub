// Counts changed scalar leaves between two plain values — an editor's working
// draft vs its last-saved snapshot. Drives the "N unsaved changes" count in the
// SaveBar. Each differing field counts once; added/removed array items count
// their own non-empty leaves; reordering counts the leaves that moved (a known
// limitation — dragging rows can inflate the number).
//
// Mirrors the per-field `fieldDirty` helper (`(a ?? "") !== (b ?? "")`) so the
// count and the field-level wash/dots agree on what "changed" means.

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {number}
 */
export function countChanges(a, b) {
  const aArr = Array.isArray(a);
  const bArr = Array.isArray(b);
  if (aArr || bArr) {
    const A = aArr ? a : [];
    const B = bArr ? b : [];
    // When elements carry a stable `_k`, match by identity rather than index so
    // reordering an unedited row reads as zero field changes (editors count the
    // reorder itself separately). Added/removed rows still count their leaves.
    const keyed = [...A, ...B].some(
      (x) => x && typeof x === "object" && "_k" in x
    );
    if (keyed) {
      const bByK = new Map(
        B.filter((x) => x && x._k != null).map((x) => [x._k, x])
      );
      const aKeys = new Set(A.filter((x) => x && x._k != null).map((x) => x._k));
      let n = 0;
      for (const item of A) n += countChanges(item, bByK.get(item?._k));
      for (const item of B) {
        if (item && item._k != null && !aKeys.has(item._k)) {
          n += countChanges(undefined, item);
        }
      }
      return n;
    }
    let n = 0;
    const len = Math.max(A.length, B.length);
    for (let i = 0; i < len; i++) n += countChanges(A[i], B[i]);
    return n;
  }

  const aObj = a && typeof a === "object";
  const bObj = b && typeof b === "object";
  if (aObj || bObj) {
    const A = aObj ? a : {};
    const B = bObj ? b : {};
    let n = 0;
    for (const k of new Set([...Object.keys(A), ...Object.keys(B)])) {
      n += countChanges(A[k], B[k]);
    }
    return n;
  }

  return (a ?? "") !== (b ?? "") ? 1 : 0;
}
