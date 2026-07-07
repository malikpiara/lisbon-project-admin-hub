import type { CollectionConfig } from "payload";

import {
  iconOptions,
  legacyIconKeys,
  toneOptions,
} from "../../lib/admin-default-data";
import { auditFields } from "../fields/audit";

// Mirrors a service category from lib/admin-default-data.js. Topics live in
// their own collection and point back here via a relationship; contacts live in
// their own `contacts` collection and point back via a many-to-many
// `categories` relationship (a service = a contact category). Payload arrays
// need a named subfield, so the string list `intro` becomes an array of { text }.
export const Services: CollectionConfig = {
  slug: "services",
  // PROTOTYPE (#2): full version history. Payload snapshots the whole doc on
  // every save → enables the version timeline + one-click restore in the editor.
  // Capped per doc to bound storage. Enabled on Services only for now to evaluate
  // the UX before rolling out to Topics/Quick Access.
  versions: { maxPerDoc: 25 },
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
      // DS names first (what the picker offers); legacy lucide-era keys stay
      // valid so pre-DS services keep saving until their icon is re-picked.
      options: [...iconOptions, ...legacyIconKeys],
      defaultValue: "building",
    },
    { name: "contactsTitle", type: "text" },
    { name: "contactsSubtitle", type: "textarea" },
    {
      name: "order",
      type: "number",
      admin: { description: "Order in the home grid" },
    },
    ...auditFields,
  ],
};
