import { defineField, defineType } from "sanity";

// Embedded object — mirrors one row of `article.faqs[]`.
export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "object",
  fields: [
    defineField({
      name: "question",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "answer", type: "text", rows: 4 }),
  ],
  preview: { select: { title: "question" } },
});
