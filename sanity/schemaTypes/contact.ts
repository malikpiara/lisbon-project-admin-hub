import { defineField, defineType } from "sanity";

// Embedded object — mirrors one row of `service.contacts[]`.
export const contact = defineType({
  name: "contact",
  title: "Contact",
  type: "object",
  fields: [
    defineField({
      name: "organization",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "service",
      title: "Service description",
      type: "text",
      rows: 2,
    }),
    defineField({ name: "phone", type: "string" }),
    defineField({
      name: "email",
      type: "string",
      validation: (rule) => rule.email(),
    }),
    defineField({ name: "category", type: "string" }),
  ],
  preview: { select: { title: "organization", subtitle: "category" } },
});
