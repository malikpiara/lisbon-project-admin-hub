import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

import { Services } from "./payload/collections/Services";
import { Topics } from "./payload/collections/Topics";
import { QuickAccess } from "./payload/collections/QuickAccess";
import { Users } from "./payload/collections/Users";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // Mounted at /cms-admin (not /admin) so it does not collide with the existing
  // localStorage mock CMS at app/(frontend)/admin.
  routes: { admin: "/cms-admin" },
  admin: {
    user: Users.slug,
    // The design system is light-only, so lock the admin to light too. Otherwise
    // it follows the OS into Payload's unbranded dark theme (our branding in
    // app/(payload)/custom.css is scoped to [data-theme="light"]).
    theme: "light",
    meta: {
      title: "Lisbon Project",
      titleSuffix: " · Lisbon Project",
      description: "Content admin for the Lisbon Project site.",
    },
    components: {
      graphics: {
        Logo: "/payload/components/Graphics#Logo",
        Icon: "/payload/components/Graphics#Icon",
      },
      // "Admin Hub" header at the top of the nav (mirrors the DS sidebar header).
      beforeNavLinks: ["/payload/components/NavHeader#NavHeader"],
      // Reverse links back to the DS team workspace (/insights, /admin). The
      // admin can't share the DS sidebar, so this bridges navigation both ways.
      afterNavLinks: ["/payload/components/NavLinks#NavLinks"],
    },
  },
  collections: [Services, Topics, QuickAccess, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI },
  }),
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
