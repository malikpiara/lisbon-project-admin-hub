import path from "path";
import { fileURLToPath } from "url";

import { sqliteAdapter } from "@payloadcms/db-sqlite";
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
    meta: { titleSuffix: " · Lisbon Project (Payload)" },
  },
  collections: [Services, Topics, QuickAccess, Users],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  db: sqliteAdapter({
    client: { url: process.env.DATABASE_URI || "file:./payload.db" },
  }),
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
});
