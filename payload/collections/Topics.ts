import type { CollectionConfig } from "payload";

import { toneOptions } from "../../lib/admin-default-data";
import { auditFields } from "../fields/audit";

// Mirrors a service.topics[] entry, with the article embedded as a group.
// `body` is a plain textarea (blank-line paragraphs) to match the existing
// data and to keep parity with the Sanity spike; the docs discuss swapping it
// for Payload's Lexical rich-text editor.
export const Topics: CollectionConfig = {
  slug: "topics",
  // Public website content: anyone can read; writes still require auth.
  access: { read: () => true },
  // Drafts power the review flow: editors save drafts ("submit for review"),
  // admins publish directly and approve/decline pending drafts at
  // /admin/review. Published content is what non-draft reads return.
  versions: { drafts: true, maxPerDoc: 25 },
  labels: { singular: "Article", plural: "Articles" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "service", "order"],
    group: "Content",
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "slug",
      type: "text",
      required: true,
      index: true,
      admin: { description: "URL segment" },
    },
    {
      name: "service",
      type: "relationship",
      relationTo: "services",
      required: true,
    },
    { name: "description", type: "textarea" },
    {
      name: "tone",
      type: "select",
      options: [...toneOptions],
      defaultValue: "teal",
    },
    {
      name: "order",
      type: "number",
      admin: { description: "Order within the parent service" },
    },
    {
      name: "article",
      type: "group",
      fields: [
        { name: "heroLead", type: "textarea" },
        {
          name: "keyLinks",
          type: "array",
          labels: { singular: "Key link", plural: "Key links" },
          admin: {
            description:
              'Shortcuts rendered as the "Key links" list at the top of the article',
          },
          fields: [
            { name: "label", type: "text", required: true },
            {
              name: "href",
              type: "text",
              required: true,
              admin: { description: "/path internal or https://… external" },
            },
          ],
        },
        {
          name: "sections",
          type: "array",
          fields: [
            { name: "heading", type: "text", required: true },
            { name: "lead", type: "textarea" },
            {
              name: "body",
              type: "textarea",
              admin: { description: "Paragraphs separated by a blank line" },
            },
            {
              name: "bullets",
              type: "array",
              labels: { singular: "Bullet", plural: "Bullets" },
              fields: [{ name: "text", type: "text", required: true }],
            },
            {
              name: "ordered",
              type: "checkbox",
              defaultValue: false,
              admin: {
                description: "Render the bullet list as a numbered list (1, 2, 3)",
              },
            },
            { name: "cta", type: "text", label: "CTA button label" },
            {
              name: "ctaHref",
              type: "text",
              label: "CTA button link",
              admin: {
                description:
                  "/path internal or https://… external; blank links to the category page",
              },
            },
            {
              // Optional two-column reference table inside a section (e.g. the
              // "Documents Required" layout): a label column paired with a
              // bulleted content column. Empty rows → no table is rendered.
              name: "table",
              type: "group",
              fields: [
                {
                  name: "title",
                  type: "text",
                  admin: {
                    description:
                      "Header row spanning both columns (e.g. “Documents Required”). Optional.",
                  },
                },
                {
                  name: "rows",
                  type: "array",
                  labels: { singular: "Table row", plural: "Table rows" },
                  fields: [
                    { name: "label", type: "text", required: true },
                    {
                      name: "items",
                      type: "array",
                      labels: { singular: "Item", plural: "Items" },
                      admin: {
                        description:
                          "Bulleted content. Links: [text](https://…).",
                      },
                      fields: [{ name: "text", type: "text", required: true }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        { name: "faqLead", type: "textarea" },
        {
          name: "faqs",
          type: "array",
          labels: { singular: "FAQ", plural: "FAQs" },
          fields: [
            { name: "question", type: "text", required: true },
            { name: "answer", type: "textarea" },
          ],
        },
      ],
    },
    ...auditFields,
  ],
};
