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
    // ── PROTOTYPE (team feedback, 2026-10 · Rafael's new contacts layout) ──
    // Several phones / emails / websites, optional social profiles, an address
    // and opening hours per organisation. Rendered as one icon row per entry
    // and hidden when empty (the old single phone/email rendered a bare icon
    // when blank). "Several locations per organisation" is noted as future:
    // when it lands, `address` + `openingHours` move into a `locations` array.
    {
      name: "phones",
      type: "array",
      labels: { singular: "Phone", plural: "Phones" },
      fields: [
        { name: "number", type: "text", required: true },
        {
          name: "label",
          type: "text",
          admin: { description: "Optional, e.g. “Helpline” or “WhatsApp”" },
        },
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
        {
          name: "label",
          type: "text",
          admin: { description: "Shown instead of the address, e.g. “Book online”" },
        },
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
    {
      name: "address",
      type: "textarea",
      admin: { description: "Street address; also drives the Directions button" },
    },
    {
      name: "openingHours",
      type: "textarea",
      label: "Opening hours",
      admin: {
        description: "One line per rule, e.g. “Mon, Tue, Thu: 10:00–13:00 / 14:00–18:00”",
      },
    },
    // ── Deprecated single fields — read as a fallback until every contact is
    // re-saved with the arrays above; not shown in the editor. ──
    { name: "phone", type: "text", admin: { description: "Deprecated — use Phones" } },
    { name: "email", type: "email", admin: { description: "Deprecated — use Emails" } },
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
