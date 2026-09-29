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
        // One diff block per row: the label, then its items as bullets.
        for (const r of b.rows) {
          const lines = nonEmpty(r.items).map((t) => `• ${t}`);
          push([clean(r.label), ...lines].filter(Boolean).join("\n"));
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
