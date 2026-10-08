/**
 * Give the live Quick Access cards the copy and glyphs of the Figma Home frame
 * (3393:7186): title, description, button label and icon. Links are left as
 * they are. Cards that match none of the three are listed and untouched.
 *
 *   pnpm tsx scripts/quick-access-figma-content.ts --from-json cards.json  preview from a REST dump (no DB)
 *   pnpm tsx scripts/quick-access-figma-content.ts                         dry run against DATABASE_URI
 *   pnpm tsx scripts/quick-access-figma-content.ts --apply                 write
 *
 * DATABASE_URI in .env.local is production. Run the dry run first.
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
  } catch {
    /* optional file */
  }
}

type Card = { id: number | string; title?: string | null; description?: string | null; href: string; cta?: string | null; iconKey?: string | null };
type Spec = { title: string; description: string; cta: string; iconKey: string; match: (c: Card) => boolean };

const has = (c: Card, re: RegExp) => re.test(`${c.href} ${c.title ?? ""}`);
const FIGMA: Spec[] = [
  {
    title: "Lisbon Project",
    description: "Learn more about our initiatives",
    cta: "Visit Website",
    iconKey: "lp-house",
    match: (c) => has(c, /lisbonproject\.org|lisbon project/i),
  },
  {
    title: "Get Support",
    description: "Our Care team and Bridge team can help you",
    cta: "Contact us",
    iconKey: "heart-partner",
    match: (c) => has(c, /social-care|need help|get support/i),
  },
  {
    title: "Emergency contacts",
    description: "Emergency support services in Lisbon.",
    cta: "Check information",
    iconKey: "emergency-contact",
    match: (c) => has(c, /emergency/i),
  },
];

const apply = process.argv.includes("--apply");
const fromJson = process.argv.indexOf("--from-json");

async function main() {
  let cards: Card[];
  let payload: any = null;
  if (fromJson >= 0) {
    const file = process.argv[fromJson + 1];
    if (!file) throw new Error("--from-json needs a file path");
    if (apply) throw new Error("--apply cannot be combined with --from-json");
    cards = JSON.parse(readFileSync(file, "utf8")).docs;
  } else {
    const { getPayload } = await import("payload");
    const { default: config } = await import("../payload.config");
    payload = await getPayload({ config });
    cards = (await payload.find({ collection: "quick-access", sort: "order", limit: 50, depth: 0 })).docs;
  }

  const used = new Set<Spec>();
  let written = 0;
  for (const c of cards) {
    const spec = FIGMA.find((s) => !used.has(s) && s.match(c));
    if (!spec) {
      console.log(`\n  ${String(c.id).padStart(3)}  ${(c.title ?? "").padEnd(26)}  ${c.href}\n       no Figma card matches — left as is`);
      continue;
    }
    used.add(spec);
    console.log(`\n  ${String(c.id).padStart(3)}  ${(c.title ?? "").padEnd(26)}  ${c.href}`);
    for (const k of ["title", "description", "cta", "iconKey"] as const) {
      const before = (c[k] ?? "") as string;
      const after = spec[k];
      console.log(`       ${k.padEnd(12)} ${before === after ? "=" : "→"} ${JSON.stringify(after)}${before === after ? "" : `   (was ${JSON.stringify(before)})`}`);
    }
    if (apply && payload) {
      await payload.update({
        collection: "quick-access",
        id: c.id,
        data: { title: spec.title, description: spec.description, cta: spec.cta, iconKey: spec.iconKey },
        overrideAccess: true,
      });
      written++;
      console.log("       written.");
    }
  }
  const missing = FIGMA.filter((s) => !used.has(s)).map((s) => s.title);
  if (missing.length) console.log(`\n  Figma cards with no live counterpart: ${missing.join(", ")}`);
  console.log(apply ? `\n${written} card(s) written.` : "\ndry run only. Re-run with --apply to write.");
  if (payload?.db?.destroy) await payload.db.destroy();
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  }
);
