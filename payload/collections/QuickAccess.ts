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
    // Added 2026-10 (team feedback): the button text used to be hardcoded per
    // href in components/home/quick-access.jsx. Empty keeps the default — see
    // lib/quick-access-defaults.js.
    {
      name: "cta",
      type: "text",
      label: "Button label",
      admin: {
        description:
          "What the card’s green button says. Leave empty for the default.",
      },
    },
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
