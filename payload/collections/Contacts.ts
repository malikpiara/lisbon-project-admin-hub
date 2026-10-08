import type { CollectionConfig } from "payload";

import { auditFields } from "../fields/audit";

// The global contacts directory. Replaces the old per-service embedded
// `contacts` array + `categoryFilters`: a contact lives here once and is tagged
// with the service categories it belongs to (`categories`, many-to-many). It
// surfaces on the home "External Contacts" table and on each tagged category page —
// the single taxonomy where category == service.
export const Contacts: CollectionConfig = {
  slug: "contacts",
  // Public website content: anyone can read; writes still require auth.
  access: { read: () => true },
  labels: { singular: "Contact", plural: "Contacts" },
  admin: {
    useAsTitle: "organization",
    defaultColumns: ["organization", "categories", "emails", "phones"],
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
    // Channels (October 2026, Rafael's contacts layout): several of each,
    // rendered as one icon link per entry and hidden when empty. The single
    // `phone` / `email` below are the pre-October fields; lib/contact-channels.js
    // reads them as a one-item list until the contact is saved again.
    {
      name: "phones",
      type: "array",
      labels: { singular: "Phone", plural: "Phones" },
      fields: [
        { name: "number", type: "text", required: true },
        { name: "label", type: "text", admin: { description: "Optional, e.g. “Helpline” or “24h”" } },
      ],
    },
    {
      name: "emails",
      type: "array",
      labels: { singular: "Email", plural: "Emails" },
      fields: [{ name: "address", type: "email", required: true }],
    },
    {
      name: "websites",
      type: "array",
      labels: { singular: "Website", plural: "Websites" },
      fields: [
        { name: "url", type: "text", required: true },
        { name: "label", type: "text", admin: { description: "Shown instead of the address, e.g. “Book online”" } },
      ],
    },
    {
      name: "socials",
      type: "array",
      labels: { singular: "Social profile", plural: "Social profiles" },
      fields: [
        {
          name: "network",
          type: "select",
          required: true,
          options: ["instagram", "facebook", "linkedin", "whatsapp", "other"],
        },
        {
          name: "handle",
          type: "text",
          required: true,
          admin: { description: "@handle, a number (WhatsApp) or a full URL" },
        },
      ],
    },
    // Legacy single fields — read as a fallback, not shown in the editors.
    { name: "phone", type: "text", admin: { hidden: true } },
    { name: "email", type: "email", admin: { hidden: true } },
    {
      name: "categories",
      type: "relationship",
      relationTo: "services",
      hasMany: true,
      required: true,
      admin: {
        description:
          "The service categories this contact belongs to. It appears on each of these category pages, and once in the home “External Contacts” table.",
      },
    },
    ...auditFields,
  ],
};
