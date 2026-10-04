// Stand-in for `drizzle-kit/api` in the Cloudflare Workers build only
// (next.config.mjs, NEXT_BUILD_TARGET=cloudflare). Payload loads drizzle-kit
// solely to push or migrate the schema — `pnpm dev` and the payload CLI on a
// local machine — never while serving a request, and withPayload leaves it out
// of production builds. On Workers that left an unresolvable require; this
// makes any accidental call fail loudly instead.
function unavailable() {
  throw new Error(
    "drizzle-kit is not available on Cloudflare Workers: push and migrate the schema from a local machine.",
  );
}

module.exports = {
  generateDrizzleJson: unavailable,
  generateMigration: unavailable,
  pushSchema: unavailable,
  upPgSnapshot: unavailable,
};
