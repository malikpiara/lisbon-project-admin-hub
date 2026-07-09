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
  {
    heading: "Documents Required",
    ordered: false,
    // Starter two-column reference table. `items` is a newline string (one
    // bullet per line), the same shape the section editor uses; links can be
    // written as [text](https://…). Editors edit or delete these rows.
    table: {
      title: "Documents Required",
      rows: [
        {
          label: "Proof of identity",
          items:
            "Valid passport or national ID card\nResidence permit, if you already have one",
        },
        {
          label: "Proof of address",
          items:
            "Recent utility bill or rental contract\nAtestado de residência from your junta de freguesia",
        },
      ],
    },
  },
  { heading: "Community Tips and Learning", ordered: false },
];

// Just the headings, for the Heading field dropdown.
export const SECTION_HEADING_PRESETS = ARTICLE_SECTION_TEMPLATES.map(
  (t) => t.heading
);
