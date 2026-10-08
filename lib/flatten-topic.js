// Flatten a topic/article doc into readable plain text, in the order the
// public page renders it. The review queue diffs two of these flattenings so
// an admin reads one Before/After of the whole article instead of a dozen
// per-field fragments. Blank-line separators keep the diff aligned by block.
//
// Section content goes through sectionBlocks — the same reader the public page
// uses — so `blocks` win and pre-blocks sections (body/bullets/table/cta) are
// synthesised into the same shape. That keeps an editor's first save of an
// older article (which migrates it to blocks) from reading as a rewrite.

// Explicit .js so `node --test` can resolve it without the bundler.
import { sectionBlocks } from "./section-blocks.js";
import { cellLines, hasHeaders } from "./table-block.js";

const clean = (v) => (v == null ? "" : String(v).trim());
const nonEmpty = (xs) => (xs || []).map(clean).filter(Boolean);

/** @param {any} doc */
export function flattenTopic(doc) {
  const parts = [];
  const push = (v) => {
    const s = clean(v);
    if (s) parts.push(s);
  };

  push(doc?.title);
  push(doc?.description);

  const a = doc?.article || {};
  push(a.heroLead);
  for (const l of a.keyLinks || []) push(`• ${l.label} (${l.href})`);
  for (const l of a.keyContacts || []) push(`• ${l.label} (${l.href})`);
  for (const l of a.keyLocations || []) push(`• ${l.label} (${l.href})`);
  for (const s of a.sections || []) {
    push(s.heading);
    push(s.lead);
    for (const b of sectionBlocks(s)) {
      if (b.type === "text") push(b.body);
      else if (b.type === "list") {
        nonEmpty(b.items).forEach((t, i) =>
          push(`${b.ordered ? `${i + 1}.` : "•"} ${t}`)
        );
      } else if (b.type === "table") {
        push(b.title);
        if (hasHeaders(b.headers)) push(b.headers.map(clean).join(" | "));
        // One diff block per row: the first cell plain, every other cell's
        // lines as bullets, prefixed with the column heading when there is one.
        for (const cells of b.rows) {
          const lines = [];
          cells.forEach((cell, i) => {
            const ls = cellLines(cell);
            if (i === 0) lines.push(...ls);
            else {
              const h = clean(b.headers[i]);
              for (const t of ls) lines.push(`• ${h ? `${h}: ` : ""}${t}`);
            }
          });
          push(lines.join("\n"));
        }
      } else if (b.type === "button" && clean(b.label)) {
        push(`[${clean(b.label)}]${b.href ? ` (${b.href})` : ""}`);
      }
    }
  }
  push(a.faqLead);
  for (const f of a.faqs || []) {
    push(`Q: ${f.question}`);
    push(`A: ${f.answer || ""}`);
  }

  return parts.join("\n\n");
}
