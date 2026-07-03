// Regenerates lib/ds-icons-data.ts from public/icons/*.svg.
//
//   node scripts/gen-ds-icons-data.mjs
//
// public/icons/ is the source of truth (exported from the Figma DS iconography
// page, node 2278:5604, normalized to currentColor). This script inlines each
// SVG — root width/height stripped so the <Icon> wrapper controls sizing,
// newlines collapsed — into the DS_ICONS record the /components/icons gallery
// and <Icon name="…"> render from.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "public", "icons");
const outFile = join(root, "lib", "ds-icons-data.ts");

const icons = {};
for (const file of readdirSync(iconsDir).filter((f) => f.endsWith(".svg")).sort()) {
  const name = file.replace(/\.svg$/, "");
  const svg = readFileSync(join(iconsDir, file), "utf8")
    .replace(/^<svg width="\d+" height="\d+" /, "<svg ")
    .replace(/\n/g, "")
    .trim();
  icons[name] = svg;
}

const out = `// AUTO-GENERATED from public/icons/*.svg — Lisbon Project DS iconography (currentColor).
// Regenerate with: node scripts/gen-ds-icons-data.mjs
export const DS_ICONS: Record<string, string> = ${JSON.stringify(icons)};
export const DS_ICON_NAMES = Object.keys(DS_ICONS).sort();
export type DsIconName = keyof typeof DS_ICONS;
`;
writeFileSync(outFile, out);
console.log(`wrote ${Object.keys(icons).length} icons to lib/ds-icons-data.ts`);
