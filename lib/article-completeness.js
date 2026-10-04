// PROTOTYPE (team feedback, 2026-10): "an article should only be published
// when it is complete". This is the single definition of "complete", shared by
// the editor (as a checklist) and the server actions (as the publish gate), so
// the two can never disagree.
//
// The bar is deliberately low — it stops the empty "New article" shells that
// reached the live site, not editorial quality (that is what review is for).

export const STUB_TITLE = "New article";

const hasText = (v) => typeof v === "string" && v.trim().length > 0;

/** @param {any} b a block in Payload shape ({ blockType, … }) */
function blockHasContent(b) {
  if (!b) return false;
  switch (b.blockType) {
    case "text":
      return hasText(b.text);
    case "list":
      return (b.items ?? []).some((i) => hasText(i?.text));
    case "table":
      return (b.rows ?? []).some((r) => hasText(r?.label));
    case "button":
      return hasText(b.label);
    default:
      return false;
  }
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
    missing.push("A short description (shown on the category card)");
  const sections = doc?.article?.sections ?? [];
  const filled = sections.filter(
    (s) =>
      hasText(s?.heading) &&
      ((s.blocks ?? []).some(blockHasContent) ||
        hasText(s?.body) ||
        (s?.bullets ?? []).some((b) => hasText(b?.text)))
  );
  if (filled.length === 0)
    missing.push("At least one section with a heading and some content");
  return { complete: missing.length === 0, missing };
}
