import { defineField, defineType } from "sanity";

// Embedded object — mirrors a topic's `article`
// ({ heroLead, sections[], faqLead, faqs[] }).
export const article = defineType({
  name: "article",
  title: "Article",
  type: "object",
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({ name: "heroLead", type: "text", rows: 2 }),
    defineField({
      name: "sections",
      type: "array",
      of: [{ type: "articleSection" }],
    }),
    defineField({ name: "faqLead", type: "text", rows: 2 }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      of: [{ type: "faq" }],
    }),
  ],
});
