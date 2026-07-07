// Flatten a topic/article doc into readable plain text, in the order the
// public page renders it. The review queue diffs two of these flattenings so
// an admin reads one Before/After of the whole article instead of a dozen
// per-field fragments. Blank-line separators keep the diff aligned by block.

/** @param {any} doc */
export function flattenTopic(doc) {
  const parts = [];
  const push = (v) => {
    const s = v == null ? "" : String(v).trim();
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
    push(s.body);
    for (const b of s.bullets || []) push(`• ${b.text}`);
    if (s.cta) push(`[${s.cta}]${s.ctaHref ? ` (${s.ctaHref})` : ""}`);
  }
  push(a.faqLead);
  for (const f of a.faqs || []) {
    push(`Q: ${f.question}`);
    push(`A: ${f.answer || ""}`);
  }

  return parts.join("\n\n");
}
