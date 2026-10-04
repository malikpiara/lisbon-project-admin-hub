import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/**
 * SPIKE (2026-09-27): OpenNext on Cloudflare Workers, copied from Cherrydock's
 * measured setup. Each of Next's caches needs a home on Workers:
 * - incremental cache → R2: the prerendered public pages (services, articles).
 * - tag cache → D1: revalidatePath("/", "layout") from the /admin actions
 *   (lib/revalidate-public.js) marks every cached page stale.
 * - revalidation queue → a Durable Object, so a stale page is rebuilt once.
 * Cache interception answers cached pages before the Next server loads.
 */
const config = {
  ...defineCloudflareConfig({
    incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived" }),
    tagCache: d1NextTagCache,
    queue: doQueue,
    enableCacheInterception: true,
  }),
  // next build, then add pg's Workers socket shim to the trace
  // (scripts/cf-trace-extra.mjs says why).
  buildCommand: "pnpm build && node scripts/cf-trace-extra.mjs",
};

export default config;
