// Runs after `next build` in the Cloudflare build (open-next.config.ts,
// buildCommand). pg picks its socket implementation by export condition:
// pg-cloudflare resolves to dist/index.js under `workerd` and to an empty stub
// everywhere else. Next traces with Node conditions, so only the stub reaches
// .next/next-server.js.nft.json and OpenNext's workerd bundle cannot find the
// real file. Adding it to the trace (rather than outputFileTracingIncludes,
// which trips a Turbopack panic next to withPayload's own include) makes
// OpenNext copy it.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = process.cwd();
const dotNext = path.join(root, ".next");

const pgPkg = createRequire(path.join(root, "package.json")).resolve("pg/package.json");
const pgCloudflareDir = path.dirname(createRequire(pgPkg).resolve("pg-cloudflare/package.json"));
const distDir = path.join(pgCloudflareDir, "dist");
const distFiles = readdirSync(distDir)
  .filter((name) => name.endsWith(".js"))
  .map((name) => path.join(distDir, name));
const extra = distFiles.map((file) => path.relative(dotNext, file));

// OpenNext copies traced files out of .next/standalone, which Next filled
// during the build from its own trace, so put the files there too.
for (const file of distFiles) {
  const target = path.join(dotNext, "standalone", path.relative(root, file));
  mkdirSync(path.dirname(target), { recursive: true });
  copyFileSync(file, target);
}

// OpenNext reads next-minimal-server.js.nft.json when it bundles Next's
// minimal server (it does on Next 16) and next-server.js.nft.json otherwise.
const nftFiles = readdirSync(dotNext).filter((name) => /^next(-minimal)?-server\.js\.nft\.json$/.test(name));
if (nftFiles.length === 0) throw new Error("cf-trace-extra: no next-*server.js.nft.json in .next/");
for (const name of nftFiles) {
  const file = path.join(dotNext, name);
  const nft = JSON.parse(readFileSync(file, "utf8"));
  const added = extra.filter((entry) => !nft.files.includes(entry));
  nft.files.push(...added);
  writeFileSync(file, JSON.stringify(nft));
  console.log(`cf-trace-extra: added ${added.length} pg-cloudflare file(s) to ${name}`);
}
