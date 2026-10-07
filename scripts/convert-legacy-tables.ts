/**
 * Convert the live tables that editors had forced into two columns — a fake
 * heading row, or "Label: value" text inside every cell — into real
 * multi-column tables (October 2026, "tabelas com mais colunas"). One
 * hand-written rule per table, so the result can be read before it is written.
 *
 *   pnpm tsx scripts/convert-legacy-tables.ts --from-json topics.json   preview from a REST dump, no DB
 *   pnpm tsx scripts/convert-legacy-tables.ts                            dry run against DATABASE_URI
 *   pnpm tsx scripts/convert-legacy-tables.ts --apply                    write the converted tables
 *
 * Only a published article with no newer pending draft is written (updating a
 * topic publishes, and would otherwise publish an editor's unreviewed draft on
 * top). Articles whose rows do not parse cleanly are left alone and listed,
 * for the editors to restructure by hand in the new table editor.
 *
 * DATABASE_URI in .env.local is production. Run the dry run first.
 */
import { readFileSync } from "node:fs";

import { tableBlockToPayload } from "../lib/table-block.js";

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

type LegacyRow = { label?: string | null; items?: { text?: string | null }[] | null; cells?: unknown[] | null };
type Rule = {
  slug: string;
  section: RegExp;
  /** Column headings, or a function deriving them (e.g. from a fake heading row). */
  headers: string[] | ((rows: LegacyRow[]) => string[]);
  /** Rows → cells. Return null to flag the table as not cleanly convertible. */
  convert: (rows: LegacyRow[]) => string[][] | null;
};

const text = (r: LegacyRow) => (r.items ?? []).map((i) => (i.text ?? "").trim()).filter(Boolean);
const pick = (items: string[], re: RegExp) => {
  const i = items.findIndex((s) => re.test(s));
  if (i < 0) return "";
  const [hit] = items.splice(i, 1);
  return hit.replace(re, "").trim();
};

const RULES: Rule[] = [
  {
    // "Risk | What it means & Warning signs" was a heading typed as row 1, and
    // every cell read "What it means: … Warning signs: …".
    slug: "online-safety-a-guide-for-parents-and-carers",
    section: /^Common Online Risks/i,
    headers: ["Risk", "What it means", "Warning signs"],
    convert: (rows) => {
      const body = rows.filter((r) => !/^risk$/i.test((r.label ?? "").trim()));
      const out: string[][] = [];
      for (const r of body) {
        const t = text(r).join("\n");
        const m = t.match(/What it means:\s*([\s\S]*?)\s*Warning signs:\s*([\s\S]*)$/i);
        if (!m) return null;
        out.push([(r.label ?? "").trim(), m[1].trim(), m[2].trim()]);
      }
      return out;
    },
  },
  {
    // Row 1 ("Level of School | Period for Enrollment/Changes") is the heading.
    slug: "basic-education-educacao-basica",
    section: /^Step-by-Step/i,
    headers: (rows) => [(rows[0]?.label ?? "").trim(), text(rows[0] ?? {})[0] ?? ""],
    convert: (rows) => rows.slice(1).map((r) => [(r.label ?? "").trim(), text(r).join("\n")]),
  },
  {
    // Each provider row carried "Key Coverages: / Benefits: / Plans:" bullets.
    slug: "health-insurance-and-health-providers-in-portugal",
    section: /^Health Providers/i,
    headers: ["Provider", "Key coverages", "Benefits", "Plans"],
    convert: (rows) =>
      rows.map((r) => {
        const items = text(r);
        const coverages = pick(items, /^Key Coverages:\s*/i);
        const benefits = pick(items, /^Benefits:\s*/i);
        const plans = pick(items, /^(Popular |Current )?Plans:\s*/i);
        // Anything else (e.g. "Services: …") stays with the benefits, as typed.
        return [(r.label ?? "").trim(), coverages, [benefits, ...items].filter(Boolean).join("\n"), plans];
      }),
  },
];

// The trafficking "Key Contacts" table mixes "Available 24h" / "Phone: …" rows
// with free-text rows; no rule fits every row, so it is left for the editors.

const apply = process.argv.includes("--apply");
const fromJson = process.argv.indexOf("--from-json");

type Topic = { id: number | string; slug: string; title: string; updatedAt?: string; article?: { sections?: any[] } };

function convertTopic(topic: Topic, rule: Rule) {
  const sections = topic.article?.sections ?? [];
  const section = sections.find((s) => rule.section.test(s.heading ?? ""));
  if (!section) return { error: `no section matching ${rule.section}` };
  const blocks: any[] = section.blocks ?? [];
  const idx = blocks.findIndex(
    (b) => b.blockType === "table" && (b.rows ?? []).some((r: LegacyRow) => !(r.cells ?? []).length)
  );
  if (idx < 0) return { error: "no legacy table block in that section (already converted?)" };
  const block = blocks[idx];
  const rows: LegacyRow[] = block.rows ?? [];
  const cells = rule.convert(rows);
  if (!cells) return { error: "rows did not parse cleanly — leave for the editors" };
  const headers = typeof rule.headers === "function" ? rule.headers(rows) : rule.headers;
  const next = tableBlockToPayload({ title: block.title ?? "", headers, rows: cells });
  const newBlocks = blocks.slice();
  newBlocks[idx] = { ...block, ...next, label: undefined };
  return { section, before: block, after: next, article: { ...topic.article, sections: sections.map((s) => (s === section ? { ...s, blocks: newBlocks } : s)) } };
}

function show(title: string, heading: string, before: any, after: any) {
  console.log(`\n=== ${title} — ${heading}`);
  console.log(`before: ${before.rows.length} rows × 2 columns`);
  console.log(`after:  ${after.rows.length} rows × ${after.columns.length} columns`);
  console.log(`  | ${after.columns.map((c: any) => c.header || "(no heading)").join(" | ")}`);
  for (const r of after.rows) {
    console.log(`  | ${r.cells.map((c: any) => c.text.replace(/\n/g, " ⏎ ").slice(0, 60)).join(" | ")}`);
  }
}

async function main() {
  let topics: Topic[];
  let payload: any = null;
  if (fromJson >= 0) {
    const file = process.argv[fromJson + 1];
    if (!file) throw new Error("--from-json needs a file path");
    topics = JSON.parse(readFileSync(file, "utf8")).docs;
    if (apply) throw new Error("--apply cannot be combined with --from-json");
  } else {
    // Env must be loaded before the config module reads it.
    const { getPayload } = await import("payload");
    const { default: config } = await import("../payload.config");
    payload = await getPayload({ config });
    const res = await payload.find({
      collection: "topics",
      where: { slug: { in: RULES.map((r) => r.slug) } },
      limit: 50,
      depth: 0,
      draft: false,
    });
    topics = res.docs;
  }

  let written = 0;
  for (const rule of RULES) {
    const topic = topics.find((t) => t.slug === rule.slug);
    if (!topic) {
      console.log(`\n=== ${rule.slug}: not found — skipped`);
      continue;
    }
    const result = convertTopic(topic, rule);
    if ("error" in result) {
      console.log(`\n=== ${topic.title}: ${result.error}`);
      continue;
    }
    show(topic.title, result.section.heading, result.before, result.after);
    if (!apply || !payload) continue;

    const versions = await payload.findVersions({
      collection: "topics",
      where: { parent: { equals: topic.id } },
      sort: "-updatedAt",
      limit: 1,
      depth: 0,
    });
    const latest = versions.docs[0];
    if (
      latest?.version?._status === "draft" &&
      topic.updatedAt &&
      new Date(latest.updatedAt) > new Date(topic.updatedAt)
    ) {
      console.log(`  SKIPPED: a pending draft is newer than the published article; approve or decline it first.`);
      continue;
    }
    await payload.update({
      collection: "topics",
      id: topic.id,
      data: { article: result.article },
      draft: false,
      overrideAccess: true,
    });
    written++;
    console.log(`  written.`);
  }

  console.log(apply ? `\n${written} article(s) written.` : "\ndry run only. Re-run with --apply to write.");
  if (payload?.db?.destroy) await payload.db.destroy();
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  }
);
