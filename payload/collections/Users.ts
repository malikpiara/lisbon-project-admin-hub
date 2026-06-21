import type { CollectionConfig } from "payload";

// Payload's admin panel needs at least one auth-enabled collection. The first
// visit to /cms-admin prompts you to create the first user (or `pnpm seed:payload`
// creates one from PAYLOAD_SEED_EMAIL / PAYLOAD_SEED_PASSWORD).
export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: { useAsTitle: "email", group: "Admin" },
  fields: [{ name: "name", type: "text" }],
};
