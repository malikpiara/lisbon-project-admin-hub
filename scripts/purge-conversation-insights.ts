/**
 * Clear the conversation-insights cache so every transcript is re-synthesised
 * on next load (e.g. after switching CLOUDFLARE_AI_MODEL). Safe: this table is a
 * regenerable cache — the page rebuilds it from PostHog transcripts. Dry-run by
 * default; pass --confirm to actually delete.
 *
 *   pnpm tsx scripts/purge-conversation-insights.ts            # dry-run
 *   pnpm tsx scripts/purge-conversation-insights.ts --confirm  # delete all rows
 */
import { readFileSync } from "node:fs";

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
  } catch {}
}

const confirm = process.argv.includes("--confirm");
const { getPayload } = await import("payload");
const { default: config } = await import("@payload-config");
const payload = await getPayload({ config });

const { totalDocs } = await payload.count({ collection: "conversation-insights" });
console.log(`conversation-insights rows: ${totalDocs}`);

if (!confirm) {
  console.log("DRY RUN — nothing deleted. Re-run with --confirm to clear the cache.");
  process.exit(0);
}
if (totalDocs === 0) {
  console.log("Nothing to delete.");
  process.exit(0);
}

const { docs } = await payload.delete({
  collection: "conversation-insights",
  where: { id: { exists: true } },
});
console.log(`Deleted ${docs.length} cached insight(s).`);
process.exit(0);
