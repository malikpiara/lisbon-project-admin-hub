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
  hooks: {
    beforeChange: [
      // PROTOTYPE (team feedback): stamp the first publish date — the article
      // hero shows "By <org> · <date>" (Figma 3393:7330). Re-publishing keeps
      // the original date; clear the field to reset it.
      ({ data, originalDoc }) => {
        if (data?._status === "published" && !data.publishedOn && !originalDoc?.publishedOn) {
          data.publishedOn = new Date().toISOString();
        }
        return data;
      },
    ],
  },
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
    // ── PROTOTYPE (team feedback): byline. The organisation that wrote the
    // article (Lisbon Project by default; partners can be named), shown with
    // the first-publish date under the hero subheading. ──
    {
      name: "authorOrg",
      type: "text",
      label: "Written by (organisation)",
      defaultValue: "Lisbon Project",
    },
    {
      name: "publishedOn",
      type: "date",
      label: "First published",
      admin: { description: "Set automatically on first publish; editable." },
    },
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
        // ── PROTOTYPE (team feedback): "Key links" becomes three optional
        // cards — Websites / Contacts / Locations (Figma 3805:13877). Any card
        // with no entries is not rendered; with none at all the whole block
        // disappears. ──
        {
          name: "keyContacts",
          type: "array",
          labels: { singular: "Key contact", plural: "Key contacts" },
          admin: { description: "People or desks to reach: a phone, an email or a page" },
          fields: [
            { name: "label", type: "text", required: true },
            {
              name: "href",
              type: "text",
              required: true,
              admin: { description: "tel:…, mailto:…, /path or https://…" },
            },
          ],
        },
        {
          name: "keyLocations",
          type: "array",
          labels: { singular: "Key location", plural: "Key locations" },
          admin: { description: "Places to go: a maps link or an address page" },
          fields: [
            { name: "label", type: "text", required: true },
            {
              name: "href",
              type: "text",
              required: true,
              admin: { description: "https://maps.… or /path" },
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
