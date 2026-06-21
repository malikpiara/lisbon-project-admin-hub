import { defineField, defineType } from "sanity";

// Mirrors `quickAccess[]` in lib/admin-default-data.js.
export const quickAccess = defineType({
  name: "quickAccess",
  title: "Quick access card",
  type: "document",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "description", type: "text", rows: 2 }),
    defineField({
      name: "href",
      title: "Link (href)",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "external",
      title: "Opens an external site",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "order",
      type: "number",
      description: "Lower numbers appear first.",
    }),
  ],
  orderings: [
    {
      title: "Manual order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "title", subtitle: "href" } },
});
