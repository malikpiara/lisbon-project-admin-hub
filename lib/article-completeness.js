// "An article should only be published when it is complete" (team feedback,
// October 2026). This is the single definition of complete, shared by the
// editor (as a checklist beside the Publish button) and the server actions
// (as the publish gate on Publish and on Approve), so the two never disagree.
//
// The bar is deliberately low: a real title, a description (the category
// card's intro line) and one section with content. It stops the empty
// "New article" shells and the blank cards that reached the live site; it
// does not judge editorial quality — that is what review is for.

export const STUB_TITLE = "New article";

const hasText = (v) => typeof v === "string" && v.trim().length > 0;

/** @param {any} b a block in Payload shape ({ blockType, … }) */
export function blockHasContent(b) {
  if (!b) return false;
  switch (b.blockType) {
    case "text":
      return hasText(b.text);
    case "list":
      return (b.items ?? []).some((i) => hasText(i?.text));
    case "table":
      return (b.rows ?? []).some(
        (r) => (r?.cells ?? []).some((c) => hasText(c?.text)) || hasText(r?.label)
      );
    case "button":
      return hasText(b.label);
    default:
      return false;
  }
}

/** @param {any} s a section in Payload shape */
export function sectionHasContent(s) {
  return (
    hasText(s?.heading) &&
    ((s?.blocks ?? []).some(blockHasContent) ||
      hasText(s?.body) ||
      (s?.bullets ?? []).some((b) => hasText(b?.text)))
  );
}

/**
 * @param {any} doc topic in Payload shape (what saveTopic receives / stores)
 * @returns {{ complete: boolean, missing: string[] }}
 */
export function articleCompleteness(doc) {
  const missing = [];
  const title = doc?.title ?? "";
  if (!hasText(title) || title.trim() === STUB_TITLE)
    missing.push("A real title (not “New article”)");
  if (!hasText(doc?.description))
    missing.push("A short description (the intro line on the category card)");
  const sections = doc?.article?.sections ?? [];
  if (!sections.some(sectionHasContent))
    missing.push("At least one section with a heading and some content");
  return { complete: missing.length === 0, missing };
}
