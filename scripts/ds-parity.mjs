#!/usr/bin/env node
// DS parity check — read-only. Catches design-system divergence in product code
// deterministically (so it can't be missed or hallucinated). Fitted to this
// project's Tailwind v4 @theme token model (tokens live in app/globals.css).
//
//   node scripts/ds-parity.mjs            # run all checks
//   node scripts/ds-parity.mjs --json     # machine-readable output
//
// Optional token-value parity (Gate A) activates when scripts/figma-tokens.snapshot.json
// exists — a { "brand-500": "#1F8E87", ... } map refreshed from live Figma.
//
// Never modifies a single file.

import { readFileSync, existsSync, readdirSync } from "fs";
import { join, relative, extname } from "path";

const ROOT = process.cwd();
const JSON_OUT = process.argv.includes("--json");
const GLOBALS = "app/globals.css";

// ── scope ──────────────────────────────────────────────────────────────────
const SCAN_DIRS = ["app", "components"];
const CODE_EXT = new Set([".js", ".jsx", ".ts", ".tsx"]);
// Excluded: the /components DS gallery (it intentionally renders raw demo values),
// the Adamastor reference-calendar visuals (big-calendar*, category-filter — exploratory,
// scoped out by the team), build dirs.
const isExcluded = (rel) =>
  rel.startsWith("app/components/") ||
  rel.includes("/node_modules/") ||
  rel.includes("/.next/") ||
  /big-calendar|category-filter/.test(rel);
// Files that legitimately hold raw hex (token maps / data), exempt from the hex rule.
const HEX_EXEMPT = /admin-tones|ds-icons-data|highlight-code|calendar-categories/;

// ── usage-hygiene rules (Gate B) ─────────────────────────────────────────────
const PALETTE =
  "red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|stone|neutral";
const RAMP = "50|100|200|300|400|500|600|700|800|900|950";
const RULES = [
  {
    id: "raw-type-size",
    severity: "fail",
    label: "Raw Tailwind text size — use a text-ds-* token",
    re: new RegExp(
      `(?<![\\w-])text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)(?![\\w-])`,
      "g"
    ),
  },
  {
    id: "off-palette-color",
    severity: "fail",
    label: "Off-DS Tailwind palette colour — use a DS token (brand-*, semantic, project-*)",
    re: new RegExp(
      `(?<![\\w-])(text|bg|border|ring|fill|stroke|divide|from|to|via|outline)-(${PALETTE})-(${RAMP})(?![\\w-])`,
      "g"
    ),
  },
  {
    id: "oversized-radius",
    severity: "warn",
    label: "rounded-2xl/3xl class — cards are rounded-lg (16px); section panels use rounded-[3.5rem]",
    re: /(?<![\w-])rounded-(2xl|3xl)(?![\w-])/g,
  },
  {
    id: "hardcoded-hex",
    severity: "warn",
    label: "Hardcoded hex colour in a component — prefer a DS token",
    re: /#[0-9a-fA-F]{6}(?![0-9a-fA-F])|#[0-9a-fA-F]{3}(?![0-9a-fA-F])/g,
    exemptFile: HEX_EXEMPT,
  },
];

// ── helpers ──────────────────────────────────────────────────────────────────
function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(join(ROOT, dir), { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const rel = join(dir, e.name);
    if (isExcluded(rel + (e.isDirectory() ? "/" : ""))) continue;
    if (e.isDirectory()) walk(rel, out);
    else if (CODE_EXT.has(extname(e.name))) out.push(rel);
  }
  return out;
}

function parseTokens(css) {
  // declared `--name: value;` (first wins) and every `var(--name)` reference
  const declared = new Map();
  const declRe = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = declRe.exec(css))) if (!declared.has(m[1])) declared.set(m[1], m[2].trim());
  return declared;
}

// ── run ──────────────────────────────────────────────────────────────────────
const files = SCAN_DIRS.flatMap((d) => walk(d));
const blob = files.map((f) => readFileSync(join(ROOT, f), "utf8")).join("\n");
const cssRaw = existsSync(join(ROOT, GLOBALS)) ? readFileSync(join(ROOT, GLOBALS), "utf8") : "";

// Gate B — usage hygiene
const findings = [];
for (const f of files) {
  const lines = readFileSync(join(ROOT, f), "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      if (rule.exemptFile && rule.exemptFile.test(f)) continue;
      rule.re.lastIndex = 0;
      let mm;
      while ((mm = rule.re.exec(line))) {
        findings.push({ rule: rule.id, severity: rule.severity, label: rule.label, file: f, line: i + 1, match: mm[0] });
      }
    }
  });
}

// Gate C — orphaned tokens (declared in globals.css, referenced nowhere)
const declared = parseTokens(cssRaw);
const refBlob = cssRaw + "\n" + blob;
const KNOWN_UNUSED = new Set(["--radius", "--brand-yellow", "--brand-yellow-soft", "--bg-water"]); // documented one-offs / shadcn defaults
const orphans = [];
for (const [name] of declared) {
  if (KNOWN_UNUSED.has(name)) continue;
  const bare = name.slice(2); // brand-500
  const used =
    refBlob.includes(`var(${name})`) ||
    new RegExp(`[\\w-]*-${bare.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(?![\\w-])`).test(refBlob) ||
    new RegExp(`--color-${bare}\\b|--text-${bare}\\b|--radius-${bare}\\b`).test(cssRaw);
  if (!used) orphans.push(name);
}

// Gate A — token value parity vs live Figma snapshot (optional)
const SNAP = "scripts/figma-tokens.snapshot.json";
let tokenParity = null;
if (existsSync(join(ROOT, SNAP))) {
  const snap = JSON.parse(readFileSync(join(ROOT, SNAP), "utf8"));
  const norm = (v) => String(v).trim().toLowerCase().replace(/\s+/g, "");
  const mism = [], missing = [];
  for (const [tok, figVal] of Object.entries(snap)) {
    const cssName = "--" + tok.replace(/^primitives\//, "").replace(/\//g, "-");
    if (!declared.has(cssName)) { missing.push({ tok, cssName, figVal }); continue; }
    if (norm(declared.get(cssName)) !== norm(figVal))
      mism.push({ tok, cssName, figVal, cssVal: declared.get(cssName) });
  }
  tokenParity = { count: Object.keys(snap).length, mism, missing };
}

// ── report ────────────────────────────────────────────────────────────────────
const fails = findings.filter((f) => f.severity === "fail");
const warns = findings.filter((f) => f.severity === "warn");
const tokenFail = tokenParity && (tokenParity.mism.length || tokenParity.missing.length);

if (JSON_OUT) {
  console.log(JSON.stringify({ files: files.length, fails, warns, orphans, tokenParity }, null, 2));
  process.exit(fails.length || tokenFail ? 1 : 0);
}

const C = { red: "\x1b[31m", yel: "\x1b[33m", grn: "\x1b[32m", dim: "\x1b[2m", b: "\x1b[1m", x: "\x1b[0m" };
const bar = "─".repeat(64);
console.log(`\n${bar}\n  DS PARITY  ·  ${files.length} product files scanned\n${bar}\n`);

const byRule = (sev) => {
  const list = findings.filter((f) => f.severity === sev);
  const groups = {};
  for (const f of list) (groups[f.rule] ??= { label: f.label, items: [] }).items.push(f);
  return groups;
};

function printGate(symbol, title, groups) {
  const total = Object.values(groups).reduce((n, g) => n + g.items.length, 0);
  console.log(`${symbol}  ${C.b}${title}${C.x}  ${C.dim}(${total})${C.x}`);
  for (const g of Object.values(groups)) {
    console.log(`     ${g.label}`);
    for (const it of g.items.slice(0, 25))
      console.log(`       ${C.dim}${it.file}:${it.line}${C.x}  ${it.match}`);
    if (g.items.length > 25) console.log(`       ${C.dim}…and ${g.items.length - 25} more${C.x}`);
  }
  console.log("");
}

// Gate A
if (tokenParity) {
  if (tokenFail) {
    console.log(`${C.red}❌${C.x}  ${C.b}[A] Token value parity${C.x}  (vs live Figma snapshot)`);
    for (const m of tokenParity.mism)
      console.log(`       ${m.cssName}  Figma ${C.grn}${m.figVal}${C.x}  CSS ${C.red}${m.cssVal}${C.x}`);
    for (const m of tokenParity.missing)
      console.log(`       ${C.yel}missing${C.x} ${m.cssName} (Figma ${m.tok} = ${m.figVal})`);
    console.log("");
  } else {
    console.log(`${C.grn}✅${C.x}  ${C.b}[A] Token value parity${C.x}  ${tokenParity.count} tokens match Figma\n`);
  }
} else {
  console.log(`${C.dim}⏭  [A] Token value parity — no ${SNAP} (refresh from Figma to enable)${C.x}\n`);
}

// Gate B
if (fails.length) printGate(`${C.red}❌${C.x}`, "[B] Usage hygiene — must fix", byRule("fail"));
else console.log(`${C.grn}✅${C.x}  ${C.b}[B] Usage hygiene${C.x}  no raw type sizes or off-DS palette colours\n`);
if (warns.length) printGate(`${C.yel}⚠️${C.x}`, "[B] Usage warnings — review", byRule("warn"));

// Gate C
if (orphans.length) {
  console.log(`${C.yel}⚠️${C.x}  ${C.b}[C] Orphaned tokens${C.x}  ${C.dim}(${orphans.length})${C.x}`);
  console.log(`     ${orphans.join(", ")}\n`);
} else console.log(`${C.grn}✅${C.x}  ${C.b}[C] Orphaned tokens${C.x}  every declared token is referenced\n`);

console.log(bar);
if (fails.length || tokenFail) console.log(`  ${C.red}${C.b}PARITY FAILED${C.x} — ${fails.length} usage error(s)${tokenFail ? " + token drift" : ""}`);
else console.log(`  ${C.grn}${C.b}PARITY OK${C.x}${warns.length || orphans.length ? `  ${C.dim}(${warns.length} warning(s), ${orphans.length} orphan(s) to review)${C.x}` : ""}`);
console.log(bar + "\n");

process.exit(fails.length || tokenFail ? 1 : 0);
