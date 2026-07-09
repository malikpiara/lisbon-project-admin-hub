// The five sections most Lisbon Project service articles follow. Two entry
// points use this list:
//   1. The Heading field's dropdown (pick one preset heading for a section).
//   2. "Insert standard sections" — scaffolds all five into a fresh article.
//
// `blocks` are in the editor shape (type + newline-string items). The editor
// stamps client `_k`s on each block/row before adding. Step-by-Step starts with
// an empty numbered list; Documents Required with a starter reference table.
export const ARTICLE_SECTION_TEMPLATES = [
  { heading: "What is it?", blocks: [] },
  { heading: "Why would I need it?", blocks: [] },
  {
    heading: "Step-by-Step guide",
    blocks: [{ type: "list", ordered: true, items: "" }],
  },
  {
    heading: "Documents Required",
    blocks: [
      {
        type: "table",
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
    ],
  },
  { heading: "Community Tips and Learning", blocks: [] },
];

// Just the headings, for the Heading field dropdown.
export const SECTION_HEADING_PRESETS = ARTICLE_SECTION_TEMPLATES.map(
  (t) => t.heading
);
