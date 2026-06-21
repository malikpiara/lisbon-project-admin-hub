import type { CollectionConfig } from "payload";

import { iconOptions, toneOptions } from "../../lib/admin-default-data";

// Mirrors a service category from lib/admin-default-data.js. Contacts are
// embedded (no page of their own); topics live in their own collection and
// point back here via a relationship. Payload arrays need a named subfield, so
// the string lists (intro, categoryFilters) become arrays of { text }/{ value }.
export const Services: CollectionConfig = {
  slug: "services",
  // Public website content: anyone can read; writes still require auth.
  access: { read: () => true },
  labels: { singular: "Service", plural: "Services" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "order"],
    group: "Content",
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: { description: "URL segment, e.g. family-child-support" },
    },
    {
      name: "shortDescription",
      type: "textarea",
      admin: { description: "Copy for the home grid card" },
    },
    { name: "breadcrumb", type: "text" },
    {
      name: "intro",
      type: "array",
      labels: { singular: "Paragraph", plural: "Paragraphs" },
      fields: [{ name: "text", type: "textarea", required: true }],
    },
    {
      name: "tone",
      type: "select",
      options: [...toneOptions],
      defaultValue: "teal",
    },
    {
      name: "iconKey",
      label: "Icon",
      type: "select",
      options: [...iconOptions],
      defaultValue: "Building2",
    },
    { name: "contactsTitle", type: "text" },
    { name: "contactsSubtitle", type: "textarea" },
    {
      name: "categoryFilters",
      type: "array",
      labels: { singular: "Filter", plural: "Filters" },
      fields: [{ name: "value", type: "text", required: true }],
    },
    {
      name: "contacts",
      type: "array",
      fields: [
        { name: "organization", type: "text", required: true },
        { name: "service", type: "textarea", label: "Service description" },
        { name: "phone", type: "text" },
        { name: "email", type: "email" },
        { name: "category", type: "text" },
      ],
    },
    {
      name: "order",
      type: "number",
      admin: { description: "Order in the home grid" },
    },
  ],
};
