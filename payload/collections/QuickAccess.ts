import type { CollectionConfig } from "payload";

import { auditFields } from "../fields/audit";

// Mirrors quickAccess[] in lib/admin-default-data.js.
export const QuickAccess: CollectionConfig = {
  slug: "quick-access",
  // Public website content: anyone can read; writes still require auth.
  access: { read: () => true },
  labels: { singular: "Quick access card", plural: "Quick access cards" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "href", "order"],
    group: "Content",
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "href", type: "text", required: true, label: "Link (href)" },
    // ── PROTOTYPE (team feedback): the icon and the button label used to be
    // hardcoded per href in components/home/quick-access.jsx, so editing a
    // card's link silently swapped its glyph for an arrow and its button for
    // "Learn more" — the "logos nos box dos Quick Access" complaint. Both are
    // now fields; the hardcoded map remains only as the fallback for cards
    // saved before this. ──
    {
      name: "iconKey",
      type: "text",
      label: "Icon",
      admin: { description: "A DS icon name (same set as service icons)" },
    },
    { name: "cta", type: "text", label: "Button label" },
    {
      name: "external",
      type: "checkbox",
      defaultValue: false,
      label: "Opens an external site",
    },
    { name: "order", type: "number" },
    ...auditFields,
  ],
};
