/**
 * Payload's dev schema push, made deliberate (2026-10-07).
 *
 *   pnpm tsx scripts/schema-push.ts            dry run: print what a push would execute
 *   pnpm tsx scripts/schema-push.ts --apply    execute it, then show what changed
 *
 * `pnpm dev` pushes the schema to DATABASE_URI the moment Payload starts, with
 * drizzle-kit deciding the statements and a prompt only when it suspects data
 * loss. .env.local points at the production database, so that is a production
 * migration run by accident. This script runs the same drizzle-kit `pushSchema`
 * Payload runs (pushDevSchema.js in @payloadcms/drizzle), but prints the
 * statements first, snapshots every public table, column, index and RLS flag
 * before and after, and refuses `--apply` when drizzle-kit reports warnings or
 * possible data loss (override with --force, after reading them).
 *
 * Env is loaded the way scripts/seed-payload.ts loads it; PAYLOAD_MIGRATING
 * stops Payload's own push on connect (connect.js checks it).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

for (const file of [".env.local", ".env"]) {
  try {
    const raw = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
      if (m && process.env[m[1]] === undefined) {
        let v = m[2].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        process.env[m[1]] = v;
      }
    }
  } catch {
    /* optional file */
  }
}
process.env.PAYLOAD_MIGRATING = "true";

const apply = process.argv.includes("--apply");
const force = process.argv.includes("--force");
const outDir = process.argv.find((a) => a.startsWith("--out="))?.slice(6) ?? "./.schema-push";

const { getPayload } = await import("payload");
const { default: config } = await import("../payload.config.ts");
const payload = await getPayload({ config });
const adapter: any = payload.db;

type Snapshot = {
  takenAt: string;
  columns: { table_name: string; column_name: string; data_type: string; is_nullable: string }[];
  indexes: { tablename: string; indexname: string }[];
  rls: { table_name: string; rls: boolean }[];
};

async function snapshot(): Promise<Snapshot> {
  const q = (text: string, params: unknown[] = []) => adapter.pool.query(text, params);
  const columns = await q(
    `select c.table_name, c.column_name, c.data_type, c.is_nullable
       from information_schema.columns c
       join information_schema.tables t on t.table_name = c.table_name and t.table_schema = c.table_schema
      where c.table_schema = $1 and t.table_type = 'BASE TABLE' order by 1, 2`,
    ["public"],
  );
  const indexes = await q(`select tablename, indexname from pg_indexes where schemaname = $1 order by 1, 2`, ["public"]);
  const rls = await q(
    `select relname as table_name, relrowsecurity as rls from pg_class
      where relnamespace = (select oid from pg_namespace where nspname = $1) and relkind = 'r' order by 1`,
    ["public"],
  );
  return { takenAt: new Date().toISOString(), columns: columns.rows, indexes: indexes.rows, rls: rls.rows };
}

const summarise = (s: Snapshot) =>
  `${new Set(s.columns.map((c) => c.table_name)).size} tables, ${s.columns.length} columns, ${s.indexes.length} indexes, RLS off on: ${
    s.rls.filter((r) => !r.rls).map((r) => r.table_name).join(", ") || "none"
  }`;

function diff(a: Snapshot, b: Snapshot) {
  const key = (c: Snapshot["columns"][number]) => `${c.table_name}.${c.column_name}`;
  const A = new Set(a.columns.map(key)), B = new Set(b.columns.map(key));
  const added = b.columns.filter((c) => !A.has(key(c))).map(key);
  const removed = a.columns.filter((c) => !B.has(key(c))).map(key);
  const AI = new Set(a.indexes.map((i) => i.indexname)), BI = new Set(b.indexes.map((i) => i.indexname));
  const addedIdx = b.indexes.filter((i) => !AI.has(i.indexname)).map((i) => i.indexname);
  const removedIdx = a.indexes.filter((i) => !BI.has(i.indexname)).map((i) => i.indexname);
  const rlsBefore = new Map(a.rls.map((r) => [r.table_name, r.rls]));
  const rlsChanged = b.rls.filter((r) => rlsBefore.has(r.table_name) && rlsBefore.get(r.table_name) !== r.rls);
  return { added, removed, addedIdx, removedIdx, rlsChanged, newTablesRls: b.rls.filter((r) => !rlsBefore.has(r.table_name)) };
}

mkdirSync(outDir, { recursive: true });
const before = await snapshot();
writeFileSync(`${outDir}/before.json`, JSON.stringify(before, null, 1));
console.log(`before: ${summarise(before)}`);

const { pushSchema } = adapter.requireDrizzleKit();
const { extensions = {}, tablesFilter } = adapter;
const result = await pushSchema(
  adapter.schema,
  adapter.drizzle,
  adapter.schemaName ? [adapter.schemaName] : undefined,
  tablesFilter,
  extensions.postgis ? ["postgis"] : undefined,
);
const statements: string[] = result.statementsToExecute ?? [];
console.log(`\n${statements.length} statement(s) a push would execute:`);
for (const s of statements) console.log(`  ${s}`);
if (result.warnings?.length) console.log(`\nwarnings:\n  ${result.warnings.join("\n  ")}`);
console.log(`\nhasDataLoss: ${result.hasDataLoss === true}`);

if (!apply) {
  console.log("\ndry run only. Re-run with --apply to execute.");
  process.exit(0);
}
if ((result.hasDataLoss || result.warnings?.length) && !force) {
  console.error("\nrefusing --apply: drizzle-kit reports warnings or possible data loss. Read them; --force to proceed.");
  process.exit(1);
}
if (!statements.length) {
  console.log("\nnothing to apply.");
  process.exit(0);
}
await result.apply();
const after = await snapshot();
writeFileSync(`${outDir}/after.json`, JSON.stringify(after, null, 1));
const d = diff(before, after);
console.log(`\napplied. after: ${summarise(after)}`);
console.log(`added columns (${d.added.length}): ${d.added.join(", ") || "none"}`);
console.log(`removed columns (${d.removed.length}): ${d.removed.join(", ") || "none"}`);
console.log(`added indexes (${d.addedIdx.length}): ${d.addedIdx.join(", ") || "none"}`);
console.log(`removed indexes (${d.removedIdx.length}): ${d.removedIdx.join(", ") || "none"}`);
console.log(`RLS changed on existing tables: ${d.rlsChanged.map((r) => `${r.table_name}=${r.rls}`).join(", ") || "none"}`);
console.log(`new tables RLS: ${d.newTablesRls.map((r) => `${r.table_name}=${r.rls}`).join(", ") || "none"}`);
process.exit(0);
