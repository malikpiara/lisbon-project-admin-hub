import { defineField, defineType } from "sanity";
import { toneOptions } from "../../lib/admin-default-data";

// Document — mirrors a `service.topics[]` entry. Modelled as its own document
// (rather than an inline array on the service) because topics have their own
// public page and a rich `article` body; a back-reference to the parent
// service keeps the relationship explicit. See docs/CMS-EVALUATION.md.
export const topic = defineType({
  name: "topic",
  title: "Topic",
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
      name: "service",
      type: "reference",
      to: [{ type: "service" }],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "description", type: "text", rows: 2 }),
    defineField({
      name: "tone",
      type: "string",
      options: { list: [...toneOptions] },
      initialValue: "teal",
    }),
    defineField({
      name: "order",
      type: "number",
      description: "Order within the parent service.",
    }),
    defineField({ name: "article", type: "article" }),
  ],
  orderings: [
    {
      title: "Manual order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: { select: { title: "title", subtitle: "service.title" } },
});
