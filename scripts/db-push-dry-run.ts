/**
 * Print the SQL that `pnpm dev` would push to the database — without pushing.
 *
 * In dev, Payload diffs the live DB against the schema built from
 * payload.config.ts and applies the difference (drizzle-kit push). Because
 * `.env.local` points at production, that diff runs against prod on every
 * `pnpm dev` / `tsx scripts/*`. This script runs the same diff with the same
 * arguments (see @payloadcms/drizzle pushDevSchema) and only prints it.
 *
 * An empty result means the next `pnpm dev` changes nothing. In particular,
 * it must never list `DISABLE ROW LEVEL SECURITY` (see docs/SECURITY-AUDIT.md).
 *
 * Usage:
 *   pnpm tsx scripts/db-push-dry-run.ts
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

// Stop connect() from pushing: the whole point is to look, not touch.
process.env.PAYLOAD_MIGRATING = "true";

const { getPayload } = await import("payload");
const { default: config } = await import("@payload-config");

const payload = await getPayload({ config });
// Adapter internals (drizzle schema, requireDrizzleKit) aren't on the public type.
const db = payload.db as any;
const { pushSchema } = db.requireDrizzleKit();

const { statementsToExecute, warnings, hasDataLoss } = await pushSchema(
  db.schema,
  db.drizzle,
  db.schemaName ? [db.schemaName] : undefined,
  db.tablesFilter,
  db.extensions?.postgis ? ["postgis"] : undefined,
);

const statements: string[] = statementsToExecute;
console.log(`\n${statements.length} statement(s) pending:\n`);
for (const s of statements) console.log(`  ${s.trim()}`);
if (warnings.length) console.log(`\nWarnings:\n  ${warnings.join("\n  ")}`);
if (hasDataLoss) console.log("\nDATA LOSS: this push would drop data.");

const disables = statements.filter((s) => /DISABLE ROW LEVEL SECURITY/i.test(s));
if (disables.length) {
  console.error(`\n✗ ${disables.length} table(s) would lose RLS on the next pnpm dev.`);
  process.exit(1);
}
process.exit(0);
