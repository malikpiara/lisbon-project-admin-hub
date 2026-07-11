// Keep article/service slugs in step with their titles. The admin editors don't
// expose a slug field — the title is the single source of truth — so the save
// actions re-derive the slug here on every save.

/**
 * Turn a human title into a URL slug: ASCII-folded, lowercased, hyphen-joined.
 * "Ação Social & Família" → "acao-social-familia". Empty input → "untitled".
 *
 * @param {string | null | undefined} input
 * @returns {string}
 */
export function slugify(input) {
  const base = String(input ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics (ç, ã, á…)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // any run of non-alphanumerics → one hyphen
    .replace(/^-+|-+$/g, "") // trim leading/trailing hyphens
    .slice(0, 80)
    .replace(/-+$/g, ""); // slice may have left a trailing hyphen
  return base || "untitled";
}

/**
 * Resolve a slug unique within `collection` (optionally scoped by `extraWhere`),
 * excluding the document being saved. Appends -2, -3, … on collision. Idempotent:
 * re-saving a doc whose title is unchanged returns its current slug.
 *
 * @param {import('payload').Payload} payload
 * @param {string} collection
 * @param {string} desired            the slugified base to aim for
 * @param {string | number | null} currentId  doc being saved (excluded from the check)
 * @param {Record<string, unknown> | null} [extraWhere]  extra `where` clause (e.g. service scope)
 * @returns {Promise<string>}
 */
export async function uniqueSlug(
  payload,
  collection,
  desired,
  currentId,
  extraWhere = null
) {
  let candidate = desired;
  for (let n = 2; ; n++) {
    const and = [{ slug: { equals: candidate } }];
    if (currentId != null) and.push({ id: { not_equals: currentId } });
    if (extraWhere) and.push(extraWhere);
    const res = await payload.find({
      collection,
      where: { and },
      limit: 1,
      depth: 0,
    });
    if (res.totalDocs === 0) return candidate;
    candidate = `${desired}-${n}`;
  }
}
