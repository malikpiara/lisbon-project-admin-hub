// The Quick Access cards' own icon family. In the Figma Home frame (3393:7186)
// the three shortcut cards draw 56px glyphs that exist for this purpose —
// icon/lp-house, icon/heartparter, icon/emergencyContact on the iconography
// page — not the 24px category icons the services use. So the admin offers
// this set here, not the service picker's. Add a name when Rafael adds a glyph
// (export it to public/icons/ and run scripts/gen-ds-icons-data.mjs).
export const QUICK_ACCESS_ICONS = ["lp-house", "heart-partner", "emergency-contact"];
