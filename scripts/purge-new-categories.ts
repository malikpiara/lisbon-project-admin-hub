/**
 * Delete the accidental "New category" services — the ones created by
 * rapid-clicking "Add category" before the double-submit guard existed.
 *
 * SAFETY: dry-run by default. Only targets services whose title is EXACTLY
 * "New category" (the default createService gives a fresh one) AND that have no
 * topics attached, so a real, renamed category can never be caught. Prints the
 * DB target so you can confirm you're pointed at the right database, backs up
 * the matched docs, and only deletes with --confirm:
 *
 *   pnpm tsx scripts/purge-new-categories.ts            # dry-run (safe)
 *   pnpm tsx scripts/purge-new-categories.ts --confirm  # actually deletes
 *
 * Env is loaded manually below, then the Payload config is imported
 * *dynamically* — the config reads process.env at module load.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

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

if (!process.env.PAYLOAD_SECRET) {
  console.error("Missing PAYLOAD_SECRET.");
  process.exit(1);
}

function describeDb(uri: string | undefined): string {
  if (!uri) return "(DATABASE_URI unset)";
  try {
    if (uri.startsWith("file:")) return uri;
    const u = new URL(uri);
    return `${u.protocol}//${u.hostname}${u.port ? ":" + u.port : ""}${u.pathname}`;
  } catch {
    return "(unparseable DATABASE_URI)";
  }
}

const confirm = process.argv.includes("--confirm");

const { getPayload } = await import("payload");
const { default: config } = await import("@payload-config");
const payload = await getPayload({ config });

// Candidates: services still carrying the default title.
const candidates = await payload.find({
  collection: "services",
  where: { title: { equals: "New category" } },
  limit: 0,
  pagination: false,
  depth: 0,
  sort: "createdAt",
});

// Count attached topics per candidate — only empty ones are safe to remove.
type Row = { id: string; title: string; slug: string; topics: number };
const rows: Row[] = [];
for (const s of candidates.docs as Array<{ id: string; title?: string; slug?: string }>) {
  const { totalDocs } = await payload.count({
    collection: "topics",
    where: { service: { equals: s.id } },
  });
  rows.push({ id: String(s.id), title: s.title ?? "", slug: s.slug ?? "", topics: totalDocs });
}

const deletable = rows.filter((r) => r.topics === 0);
const skipped = rows.filter((r) => r.topics > 0);

console.log("\n─────────────────────────────────────────────");
console.log("  Database:", describeDb(process.env.DATABASE_URI));
console.log(`  Services titled "New category":`, rows.length);
console.log("  Empty (deletable):", deletable.length);
console.log("  With topics (SKIPPED):", skipped.length);
console.log("─────────────────────────────────────────────");
for (const r of deletable) console.log(`   • ${r.slug}  (${r.id})`);
if (skipped.length) {
  console.log("  ── skipped (have topics, left alone):");
  for (const r of skipped) console.log(`   • ${r.slug}  (${r.id}) — ${r.topics} topic(s)`);
}
console.log("─────────────────────────────────────────────\n");

if (!confirm) {
  console.log(
    `DRY RUN — nothing deleted. Re-run with --confirm to delete ${deletable.length} empty "New category" services.\n`
  );
  process.exit(0);
}

if (deletable.length === 0) {
  console.log("Nothing to delete.\n");
  process.exit(0);
}

// Back up the matched docs (full) before deleting, so this is reversible.
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dir = new URL("./backups/", import.meta.url);
mkdirSync(dir, { recursive: true });
const backupDocs = await payload.find({
  collection: "services",
  where: { id: { in: deletable.map((r) => r.id) } },
  limit: 0,
  pagination: false,
  depth: 1,
});
const backupPath = new URL(`new-categories-backup-${stamp}.json`, dir);
writeFileSync(
  backupPath,
  JSON.stringify(
    { exportedAt: new Date().toISOString(), count: backupDocs.docs.length, docs: backupDocs.docs },
    null,
    2
  )
);
console.log(`Backed up ${backupDocs.docs.length} services to ${backupPath.pathname}`);

console.log(`Deleting ${deletable.length} empty "New category" services…`);
let deleted = 0;
for (const r of deletable) {
  await payload.delete({ collection: "services", id: r.id });
  deleted++;
}
console.log(`Done. Deleted ${deleted} services.\n`);
process.exit(0);
