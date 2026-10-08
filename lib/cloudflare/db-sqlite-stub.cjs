// Stand-in for `@payloadcms/db-sqlite` in the Cloudflare Workers build only
// (next.config.mjs, NEXT_BUILD_TARGET=cloudflare). payload.config.ts imports
// the SQLite adapter for the local sandbox (DATABASE_ADAPTER=sqlite), and the
// Workers bundle marked its driver, @libsql/client, as an external module that
// does not exist there: every request that loaded Payload failed with "No such
// module" (/login, /admin and the API went down on 2026-10-08). Workers always
// use Postgres, so the adapter is replaced with one that fails loudly if used.
function sqliteAdapter() {
  throw new Error(
    "The SQLite sandbox adapter is not available on Cloudflare Workers: unset DATABASE_ADAPTER.",
  );
}

module.exports = { sqliteAdapter };
