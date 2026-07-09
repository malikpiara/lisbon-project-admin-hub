/**
 * Delete ALL topics (articles) from whatever database DATABASE_URI points at.
 *
 * One-off cleanup: the current 146 topics are test content and the team is about
 * to start adding real articles. Deletes via the Payload API so nested rows
 * (sections, FAQs, key links, bullets) and versions cascade correctly.
 *
 * SAFETY: dry-run by default — prints the DB target, the topic count, and a
 * sample so you can confirm you're pointed at the right database. It only
 * deletes when you pass --confirm:
 *
 *   pnpm tsx scripts/purge-topics.ts            # dry-run (safe)
 *   pnpm tsx scripts/purge-topics.ts --confirm  # actually deletes
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
  console.error("Missing PAYLOAD_SECRET. See docs/archive/CMS-EVALUATION.md.");
  process.exit(1);
}

// Show which DB we're about to touch, without leaking credentials.
function describeDb(uri: string | undefined): string {
  if (!uri) return "(DATABASE_URI unset)";
  try {
    if (uri.startsWith("file:")) return uri; // local SQLite — safe to show
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

const all = { id: { exists: true } } as const;

const { totalDocs } = await payload.count({ collection: "topics" });
const sample = await payload.find({
  collection: "topics",
  limit: 20,
  depth: 0,
  sort: "-createdAt",
});

console.log("\n─────────────────────────────────────────────");
console.log("  Database:", describeDb(process.env.DATABASE_URI));
console.log("  Topics found:", totalDocs);
console.log("─────────────────────────────────────────────");
console.log("  Sample (newest 20):");
for (const t of sample.docs) {
  const title = (t as { title?: string }).title ?? "(untitled)";
  const slug = (t as { slug?: string }).slug ?? "";
  const status = (t as { _status?: string })._status ?? "";
  console.log(`   • [${status}] ${title}  —  ${slug}`);
}
console.log("─────────────────────────────────────────────\n");

if (!confirm) {
  console.log(
    `DRY RUN — nothing deleted. Re-run with --confirm to delete all ${totalDocs} topics.\n`
  );
  process.exit(0);
}

// Back up every topic (full content) before deleting, so this is reversible.
console.log("Backing up all topics before deletion…");
const backup = await payload.find({
  collection: "topics",
  limit: 0,
  pagination: false,
  depth: 1,
});
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dir = new URL("./backups/", import.meta.url);
mkdirSync(dir, { recursive: true });
const backupPath = new URL(`topics-backup-${stamp}.json`, dir);
writeFileSync(
  backupPath,
  JSON.stringify({ exportedAt: new Date().toISOString(), count: backup.docs.length, docs: backup.docs }, null, 2)
);
console.log(`Wrote ${backup.docs.length} topics to ${backupPath.pathname}`);

console.log(`Deleting all ${totalDocs} topics…`);
const result = await payload.delete({ collection: "topics", where: all });
const deleted = Array.isArray(result?.docs) ? result.docs.length : totalDocs;
console.log(`Done. Deleted ${deleted} topics.\n`);
process.exit(0);
