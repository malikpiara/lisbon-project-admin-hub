import type { CollectionConfig } from "payload";

// Append-only activity log: one row per create / update / delete made through
// the Studio. Powers /studio/history ("who changed what, when") — including
// deletes, which the per-doc createdBy/updatedBy fields can't show. Written by
// the Studio server actions (lib/audit-log); never edited by hand.
export const AuditLog: CollectionConfig = {
  slug: "audit-log",
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => false, // only via the Local API (server actions)
    update: () => false,
    delete: () => false,
  },
  labels: { singular: "Activity", plural: "Activity" },
  admin: {
    useAsTitle: "docTitle",
    defaultColumns: ["action", "collectionSlug", "docTitle", "user", "createdAt"],
    group: "System",
  },
  fields: [
    {
      name: "action",
      type: "select",
      required: true,
      options: [
        "created",
        "updated",
        "deleted",
        // Review flow on Articles: editors submit; admins approve/decline.
        "submitted",
        "approved",
        "declined",
      ],
    },
    {
      name: "collectionSlug",
      type: "text",
      required: true,
      admin: { description: "services | topics | quick-access" },
    },
    { name: "docId", type: "text" },
    {
      name: "docTitle",
      type: "text",
      admin: { description: "Title snapshot — survives even if the doc is deleted" },
    },
    { name: "user", type: "relationship", relationTo: "users" },
  ],
};
