import type { CollectionConfig } from "payload";

import { auditFields } from "../fields/audit";

// The global contacts directory. Replaces the old per-service embedded
// `contacts` array + `categoryFilters`: a contact lives here once and is tagged
// with the service categories it belongs to (`categories`, many-to-many). It
// surfaces on the home "All Contacts" table and on each tagged category page —
// the single taxonomy where category == service.
export const Contacts: CollectionConfig = {
  slug: "contacts",
  // Public website content: anyone can read; writes still require auth.
  access: { read: () => true },
  labels: { singular: "Contact", plural: "Contacts" },
  admin: {
    useAsTitle: "organization",
    defaultColumns: ["organization", "categories", "email", "phone"],
    group: "Content",
  },
  fields: [
    { name: "organization", type: "text", required: true },
    {
      name: "service",
      type: "textarea",
      label: "Service provided",
      admin: {
        description:
          "What the organization does — the “Service Provided” column. This is free text, distinct from the Categories below.",
      },
    },
    { name: "phone", type: "text" },
    { name: "email", type: "email" },
    {
      name: "categories",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      required: true,
      admin: {
        description:
          "The service categories this contact belongs to. It appears on each of these category pages, and once in the home “All Contacts” table.",
      },
    },
    ...auditFields,
  ],
};
