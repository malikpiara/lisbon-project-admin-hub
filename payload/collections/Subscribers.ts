import type { CollectionConfig } from "payload";

// Newsletter signups from the public site footer. Written by the public
// `subscribe` server action (components/site/newsletter-actions.js) through
// Payload's Local API, which bypasses access control — so `create` stays closed
// to unauthenticated REST/GraphQL callers (no public spam endpoint). Read /
// update / delete inherit Payload's default (authenticated users only), so only
// signed-in team members can see the subscriber list. createdAt is added by
// Payload automatically and doubles as the signup date.
export const Subscribers: CollectionConfig = {
  slug: "subscribers",
  labels: { singular: "Subscriber", plural: "Subscribers" },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "firstName", "source", "createdAt"],
    group: "Community",
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      index: true,
    },
    { name: "firstName", type: "text" },
    {
      name: "source",
      type: "text",
      defaultValue: "footer",
      admin: {
        readOnly: true,
        description: "Where the signup came from (e.g. the site footer form).",
      },
    },
  ],
};
