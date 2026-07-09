// The five sections most Lisbon Project service articles follow. Two entry
// points use this list:
//   1. The Heading field's dropdown (pick one preset heading for a section).
//   2. "Insert standard sections" — scaffolds all five into a fresh article.
//
// The Step-by-Step guide is always a numbered list, so its template sets
// `ordered: true`. Picking that preset (or scaffolding) flips the section's
// "Numbered list" flag automatically.
export const ARTICLE_SECTION_TEMPLATES = [
  { heading: "What is it?", ordered: false },
  { heading: "Why would I need it?", ordered: false },
  { heading: "Step-by-Step guide", ordered: true },
  { heading: "Documents Required", ordered: false },
  { heading: "Community Tips and Learning", ordered: false },
];

// Just the headings, for the Heading field dropdown.
export const SECTION_HEADING_PRESETS = ARTICLE_SECTION_TEMPLATES.map(
  (t) => t.heading
);
