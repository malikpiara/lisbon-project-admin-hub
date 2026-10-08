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
    // Set when an editor submits a draft for review; cleared when it is
    // published, approved, declined or unpublished. Payload's drafts alone
    // cannot tell "saved privately" from "please review this" — this flag is
    // the difference, and the review queue filters on it (lib/publish-state.js).
    {
      name: "reviewRequested",
      type: "checkbox",
      defaultValue: false,
      admin: { position: "sidebar", description: "Submitted for review by an editor" },
    },
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
              // Composable content: an ordered list of blocks (text / list /
              // table / button) in any order. Replaces the fixed body→bullets→
              // table→cta template below. Sections created/saved before this
              // field are read via lib/content.js synthesis from the deprecated
              // fields, so no data migration is required.
              name: "blocks",
              type: "blocks",
              blocks: [
                {
                  slug: "text",
                  labels: { singular: "Text", plural: "Text blocks" },
                  fields: [
                    {
                      name: "text",
                      type: "textarea",
                      required: true,
                      admin: {
                        description:
                          "Paragraphs separated by a blank line. Links: [text](https://…) or a pasted web address.",
                      },
                    },
                  ],
                },
                {
                  slug: "list",
                  labels: { singular: "List", plural: "Lists" },
                  fields: [
                    {
                      name: "ordered",
                      type: "checkbox",
                      defaultValue: false,
                      admin: { description: "Numbered (1, 2, 3) instead of bulleted" },
                    },
                    {
                      name: "items",
                      type: "array",
                      labels: { singular: "Item", plural: "Items" },
                      fields: [{ name: "text", type: "text", required: true }],
                    },
                  ],
                },
                {
                  slug: "table",
                  labels: { singular: "Table", plural: "Tables" },
                  fields: [
                    {
                      name: "title",
                      type: "text",
                      admin: {
                        description:
                          "Title row spanning the table (e.g. “Documents Required”). Optional.",
                      },
                    },
                    // Since 2026-10 a table has 2 to 4 columns: `columns` holds
                    // the headings (always one entry per column, so the width is
                    // explicit even when no heading is typed) and each row holds
                    // one `cells` entry per column. `label` + `items` are the
                    // pre-October two-column shape; lib/table-block.js reads
                    // both, so old articles need no migration. The cap of 4 is
                    // a readability limit (see that file).
                    {
                      name: "columns",
                      type: "array",
                      labels: { singular: "Column", plural: "Columns" },
                      maxRows: 4,
                      admin: {
                        description:
                          "Column headings, left to right (2 to 4). Leave them empty for a table without a heading row.",
                      },
                      fields: [{ name: "header", type: "text" }],
                    },
                    {
                      name: "rows",
                      type: "array",
                      labels: { singular: "Table row", plural: "Table rows" },
                      fields: [
                        {
                          name: "cells",
                          type: "array",
                          labels: { singular: "Cell", plural: "Cells" },
                          maxRows: 4,
                          admin: {
                            description:
                              "One per column. Several lines in a cell render as bullets.",
                          },
                          fields: [{ name: "text", type: "textarea" }],
                        },
                        // Legacy two-column row (read-only fallback).
                        { name: "label", type: "text", admin: { hidden: true } },
                        {
                          name: "items",
                          type: "array",
                          labels: { singular: "Item", plural: "Items" },
                          admin: { hidden: true },
                          fields: [{ name: "text", type: "text", required: true }],
                        },
                      ],
                    },
                  ],
                },
                {
                  slug: "button",
                  labels: { singular: "Button", plural: "Buttons" },
                  fields: [
                    { name: "label", type: "text", required: true },
                    {
                      name: "href",
                      type: "text",
                      admin: {
                        description:
                          "/path internal or https://… external; blank links to the service page",
                      },
                    },
                  ],
                },
              ],
            },
            // ── Deprecated (pre-blocks) fields — kept so existing content is
            // synthesised into blocks on read; removed once all articles are
            // re-saved. Do not surface in the new editor. ──
            {
              name: "body",
              type: "textarea",
              admin: { description: "Deprecated — use blocks. Paragraphs separated by a blank line" },
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
