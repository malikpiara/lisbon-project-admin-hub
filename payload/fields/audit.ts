import type { Field } from "payload";

// Who-created / who-last-modified attribution. Important for a volunteer-run
// org: editors need to see who touched a record and when. Set explicitly by the
// Studio server actions from the authenticated user (the Local API doesn't infer
// it). Read-only in the Payload admin — they're system fields, not editable.
// createdAt / updatedAt timestamps are provided by Payload automatically.
export const auditFields: Field[] = [
  {
    name: "createdBy",
    type: "relationship",
    relationTo: "users",
    admin: { readOnly: true, position: "sidebar" },
  },
  {
    name: "updatedBy",
    type: "relationship",
    relationTo: "users",
    admin: { readOnly: true, position: "sidebar" },
  },
];
