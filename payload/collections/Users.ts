import type { CollectionConfig } from "payload";

const isAdmin = ({ req }: { req: { user?: { role?: string } | null } }) =>
  req.user?.role === "admin";

// Payload's admin panel needs at least one auth-enabled collection. The first
// visit to /cms-admin prompts you to create the first user (or `pnpm seed:payload`
// creates one from PAYLOAD_SEED_EMAIL / PAYLOAD_SEED_PASSWORD).
//
// Two-tier roles: `admin` manages the team (create/remove accounts, reset
// passwords, change roles); `editor` edits content only. These access rules
// gate the REST/GraphQL API and /cms-admin; the /admin server actions run on
// the Local API (which bypasses access rules), so they enforce the same
// checks explicitly in app/(frontend)/admin/users/actions.js.
export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    // Keep team members signed in for 30 days. This is an internal tool used in
    // short bursts across the week, and Payload's 2h default kept logging people
    // out mid-edit. `tokenExpiration` is in seconds; the session cookie's
    // lifetime follows it.
    tokenExpiration: 60 * 60 * 24 * 30, // 30 days
  },
  access: {
    read: ({ req }) => Boolean(req.user),
    create: isAdmin,
    delete: isAdmin,
    update: ({ req, id }) =>
      req.user?.role === "admin" || String(req.user?.id) === String(id),
  },
  admin: { useAsTitle: "email", group: "Admin" },
  fields: [
    { name: "name", type: "text" },
    {
      // When the person first proved they hold the account: completing their
      // invite on /welcome or signing in. Null = invited but never joined —
      // the Team page uses this to show invite status and offer a fresh
      // invite link instead of a password reset. Written only via the Local
      // API (welcome/login actions); no client may set it.
      name: "joinedAt",
      type: "date",
      access: { create: () => false, update: () => false },
      admin: {
        readOnly: true,
        description: "Set automatically the first time the person signs in",
      },
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      // Users may self-update (name, password) but only admins may change
      // roles — otherwise an editor could self-promote via the API.
      access: { update: isAdmin },
      admin: {
        description:
          "Admins manage the team (accounts, passwords, roles); editors manage content only",
      },
    },
  ],
};
