import {
  SITE_TEXT_FIELDS,
  SITE_TEXT_SECTIONS,
  withSiteTextDefaults,
} from "./site-text-defaults";

// Flatten the site-text global into readable plain text, in page order, for
// the review queue's word diff (same idea as flatten-topic.js). Each line is
// "Section · Field: value" so a reviewer can tell two "Title" fields apart;
// blank-line separators keep the diff aligned field by field.

const SECTION_TITLE = Object.fromEntries(
  SITE_TEXT_SECTIONS.map((s) => [s.id, s.title])
);

/** @param {any} doc */
export function flattenSiteText(doc) {
  const copy = withSiteTextDefaults(doc);
  const parts = [];
  for (const f of SITE_TEXT_FIELDS) {
    const where = `${SECTION_TITLE[f.section]} · ${f.label}`;
    if (f.kind === "hours") {
      for (const r of copy[f.key]) parts.push(`${where}: ${r.day} — ${r.hours}`);
    } else {
      parts.push(`${where}: ${String(copy[f.key]).trim() || "(empty)"}`);
    }
  }
  return parts.join("\n\n");
}
