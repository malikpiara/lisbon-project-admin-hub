import { defineField, defineType } from "sanity";
import { iconOptions, toneOptions } from "../../lib/admin-default-data";

// Document — mirrors one service category from lib/admin-default-data.js.
// `contacts` are embedded (they have no page of their own); `topics` live in
// their own document and point back here via a reference.
export const service = defineType({
  name: "service",
  title: "Service category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortDescription",
      title: "Short description (home grid card)",
      type: "text",
      rows: 2,
    }),
    defineField({ name: "breadcrumb", type: "string" }),
    defineField({
      name: "intro",
      title: "Intro paragraphs",
      type: "array",
      of: [{ type: "text" }],
    }),
    defineField({
      name: "tone",
      type: "string",
      options: { list: [...toneOptions] },
      initialValue: "teal",
    }),
    defineField({
      name: "iconKey",
      title: "Icon",
      type: "string",
      options: { list: [...iconOptions] },
      initialValue: "Building2",
    }),
    defineField({ name: "contactsTitle", type: "string" }),
    defineField({ name: "contactsSubtitle", type: "text", rows: 2 }),
    defineField({
      name: "categoryFilters",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "contacts",
      type: "array",
      of: [{ type: "contact" }],
    }),
    defineField({
      name: "order",
      type: "number",
      description: "Order in the home grid.",
    }),
  ],
  orderings: [
    {
      title: "Manual order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "title", subtitle: "shortDescription" } },
});
