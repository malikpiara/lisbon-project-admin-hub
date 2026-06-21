import { defineField, defineType } from "sanity";

// Embedded object — mirrors one row of `article.sections[]`.
// `body` stays plain text (blank-line-separated paragraphs) to match the
// existing data exactly; see docs/CMS-EVALUATION.md for the rich-text path.
export const articleSection = defineType({
  name: "articleSection",
  title: "Article section",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "lead", type: "text", rows: 2 }),
    defineField({
      name: "body",
      type: "text",
      rows: 6,
      description: "Paragraphs separated by a blank line.",
    }),
    defineField({
      name: "bullets",
      type: "array",
      of: [{ type: "string" }],
      description: "One bullet per item.",
    }),
    defineField({ name: "cta", title: "CTA button label", type: "string" }),
  ],
  preview: { select: { title: "heading", subtitle: "lead" } },
});
