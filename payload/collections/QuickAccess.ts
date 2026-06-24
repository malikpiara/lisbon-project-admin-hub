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
