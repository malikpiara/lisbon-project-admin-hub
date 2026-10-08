/**
 * One-off for the explicit-publishing release (October 2026). Two steps:
 *
 *  1. Unpublish the published shells: articles still titled "New article" or
 *     with no section content at all. They become drafts (content kept), so
 *     they leave the category pages; the team finishes or deletes them in
 *     /admin/articles.
 *  2. Flag every draft that is waiting for review today (newest version is a
 *     draft, title is not the stub) as `reviewRequested`, so the review queue —
 *     which now only lists submitted drafts — keeps showing them.
 *
 *   pnpm tsx scripts/publish-state-migration.ts --from-json topics.json  preview step 1 from a REST dump
 *   pnpm tsx scripts/publish-state-migration.ts                           dry run against DATABASE_URI
 *   pnpm tsx scripts/publish-state-migration.ts --apply                   write
 *   pnpm tsx scripts/publish-state-migration.ts --unflag 306,349,358      dry run, then add --apply
 *
 * DATABASE_URI in .env.local is production. Run the dry run first.
 */
import { readFileSync } from "node:fs";

import { STUB_TITLE, articleCompleteness, sectionHasContent } from "../lib/article-completeness.js";

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

const apply = process.argv.includes("--apply");

// RAN ON PRODUCTION 2026-10-08. Do not --apply it again: since then, an
// unsubmitted draft is someone's saved work, and step 2 would put every one
// of them in the review queue. --unflag stays available; anything else needs
// --rerun on purpose.
if (apply && !process.argv.includes("--unflag") && !process.argv.includes("--rerun")) {
  console.error("publish-state-migration already ran on 2026-10-08; step 2 would now flag unsubmitted drafts. Pass --rerun if you really mean it.");
  process.exit(1);
}
const fromJson = process.argv.indexOf("--from-json");

type Topic = { id: number | string; slug: string; title: string; _status?: string; article?: { sections?: any[] } };

const isShell = (t: Topic) =>
  (t.title ?? "").trim() === STUB_TITLE || !(t.article?.sections ?? []).some(sectionHasContent);

async function main() {
  let payload: any = null;
  let published: Topic[];
  if (fromJson >= 0) {
    const file = process.argv[fromJson + 1];
    if (!file) throw new Error("--from-json needs a file path");
    if (apply) throw new Error("--apply cannot be combined with --from-json");
    published = JSON.parse(readFileSync(file, "utf8")).docs.filter((t: Topic) => t._status === "published");
  } else {
    const { getPayload } = await import("payload");
    const { default: config } = await import("../payload.config");
    payload = await getPayload({ config });
    published = (
      await payload.find({
        collection: "topics",
        where: { _status: { equals: "published" } },
        limit: 1000,
        depth: 0,
        draft: false,
      })
    ).docs;
  }

  // --unflag 306,349,358: clear reviewRequested on those articles' newest
  // draft. Added after the 2026-10-08 run, whose step 2 flagged the shells
  // step 1 had just unpublished (fixed below: pending is read first).
  const unflag = process.argv.indexOf("--unflag");
  if (unflag >= 0) {
    if (!payload) throw new Error("--unflag needs the database");
    const ids = String(process.argv[unflag + 1] ?? "").split(",").filter(Boolean);
    if (!ids.length) throw new Error("--unflag needs ids, e.g. --unflag 306,349,358");
    for (const id of ids) {
      if (apply) {
        await payload.update({ collection: "topics", id, data: { reviewRequested: false }, draft: true, overrideAccess: true });
      }
      console.log(`  ${apply ? "unflagged" : "would unflag"} ${id}`);
    }
    console.log(apply ? "\nDone." : "\ndry run only. Re-run with --apply to write.");
    if (payload?.db?.destroy) await payload.db.destroy();
    return;
  }

  // Step 2's candidates are read BEFORE step 1 writes: unpublishing a shell
  // makes its newest version a draft, and the 2026-10-08 run flagged those as
  // waiting for review.
  const pendingBefore = payload
    ? (
        await payload.findVersions({
          collection: "topics",
          where: {
            latest: { equals: true },
            "version._status": { equals: "draft" },
            "version.title": { not_equals: STUB_TITLE },
            "version.reviewRequested": { not_equals: true },
          },
          limit: 500,
          depth: 0,
        })
      ).docs
    : [];

  console.log(`\n=== Step 1: published shells (${published.length} published articles scanned)`);
  const shells = published.filter(isShell);
  for (const t of shells) {
    const { missing } = articleCompleteness(t);
    console.log(`  ${String(t.id).padStart(4)}  ${t.title.slice(0, 40).padEnd(40)}  ${t.slug.slice(0, 40)}  → ${missing.join("; ")}`);
  }
  console.log(`  ${shells.length} to unpublish`);
  if (apply && payload) {
    for (const t of shells) {
      await payload.update({
        collection: "topics",
        id: t.id,
        data: { _status: "draft", reviewRequested: false },
        draft: false,
        overrideAccess: true,
      });
      console.log(`  unpublished ${t.id}`);
    }
  }

  if (!payload) {
    console.log("\n=== Step 2 needs the database (pending drafts are not in a REST dump).");
    console.log("\ndry run only. Re-run without --from-json, then with --apply, to write.");
    return;
  }

  console.log(`\n=== Step 2: drafts waiting for review today → reviewRequested`);
  // A shell that also had a real draft waiting (389 on 2026-10-08) was
  // already in pendingBefore, so it is still flagged; the versions step 1
  // created are not.
  const pending = pendingBefore;
  for (const v of pending) {
    const parent = typeof v.parent === "object" ? v.parent?.id : v.parent;
    console.log(`  ${String(parent).padStart(4)}  ${String(v.version?.title ?? "").slice(0, 40).padEnd(40)}  draft from ${v.updatedAt}`);
    if (apply) {
      // A draft update merges onto the newest draft, so the content is kept.
      await payload.update({
        collection: "topics",
        id: parent,
        data: { reviewRequested: true },
        draft: true,
        overrideAccess: true,
      });
      console.log(`  flagged ${parent}`);
    }
  }
  console.log(`  ${pending.length} to flag`);
  console.log(apply ? "\nDone." : "\ndry run only. Re-run with --apply to write.");
  if (payload?.db?.destroy) await payload.db.destroy();
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  }
);
