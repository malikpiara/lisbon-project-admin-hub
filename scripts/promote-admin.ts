/**
 * Give one account the `admin` role — the bootstrap for the two-tier roles
 * on the Users collection (accounts created before roles existed default to
 * `editor`, and editors can't self-promote by design).
 *
 * Usage:
 *   npx tsx scripts/promote-admin.ts [email]
 *
 * Defaults to PAYLOAD_SEED_EMAIL (admin@example.com) when no email is given.
 */
import { readFileSync } from "node:fs";

// --- load .env.local then .env (first definition wins), like seed-payload ---
for (const file of [".env.local", ".env"]) {
  try {
    const raw = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        let v = m[2].trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        ) {
          v = v.slice(1, -1);
        }
        process.env[m[1]] = v;
      }
    }
  } catch {
    // file absent — rely on ambient env
  }
}

const email =
  process.argv[2] || process.env.PAYLOAD_SEED_EMAIL || "admin@example.com";

// Import after env is set (config reads process.env at load time).
const { getPayload } = await import("payload");
const { default: config } = await import("@payload-config");

const payload = await getPayload({ config });
const { docs } = await payload.find({
  collection: "users",
  where: { email: { equals: email } },
  limit: 1,
  depth: 0,
});

if (!docs.length) {
  console.error(`No user found with email ${email}`);
  process.exit(1);
}

await payload.update({
  collection: "users",
  id: docs[0].id,
  data: { role: "admin" },
});
console.log(`${email} is now an admin.`);
process.exit(0);
