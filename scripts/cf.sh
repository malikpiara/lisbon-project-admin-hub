#!/usr/bin/env bash
# Build, preview and deploy the Cloudflare Worker (SPIKE, 2026-09-27).
# Adapted from Cherrydock's scripts/cf.sh, which found these traps on its own
# move from Vercel (2026-09-24).
#
#   scripts/cf.sh build     clean OpenNext build into .open-next/
#   scripts/cf.sh preview   run that build locally in workerd (wrangler dev)
#   scripts/cf.sh deploy    fill the R2 cache + D1 table, deploy to production
#   scripts/cf.sh upload    same, as a new version without promoting it
#
#   A second argument names a Wrangler environment (2026-10-07): `build preview`
#   builds for the preview Worker (DEPLOY_ENV=preview, its workers.dev URL as
#   NEXT_PUBLIC_SITE_URL unless set) and `deploy preview` fills THAT Worker's
#   cache bucket and tag table before deploying it. See wrangler.jsonc's env.
#
# 1. OpenNext compiles every value in .env, .env.local, … into the Worker
#    bundle (.open-next/cloudflare/next-env.mjs), server secrets included.
#    Unlike Cherrydock, this app's build must reach the database (the public
#    pages are prerendered from Payload), so the build gets .env.local's
#    values as process environment and the file itself is set aside. The
#    bundle is checked for non-public values after every build and before
#    every preview or deploy.
# 2. unstable_cache entries in .next/cache/fetch-cache outlive their data, so
#    the fetch cache is cleared before every build, and deploy refuses a
#    build older than 30 minutes (the R2 cache it uploads is build-time data).
# 3. Wrangler reads .env.local for its own login and would take the app's
#    CLOUDFLARE_API_TOKEN (the Workers AI token) for it. CLOUDFLARE_* values
#    are never exported, and deploy/upload run with .env.local set aside.
# 4. Next inlines NEXT_PUBLIC_* values at build time, and a missing one
#    becomes undefined in the client without failing anything, so the build
#    stops unless every NEXT_PUBLIC_* name in .env.example is set.
set -euo pipefail

cmd="${1:-}"
env="${2:-}"
case "$cmd" in
  build | preview | deploy | upload) ;;
  *)
    echo "usage: scripts/cf.sh build|preview|deploy|upload [preview]" >&2
    exit 2
    ;;
esac
case "$env" in
  "" | preview) ;;
  *)
    echo "cf.sh: unknown environment '$env' (only 'preview' is defined in wrangler.jsonc)" >&2
    exit 2
    ;;
esac
cd "$(dirname "$0")/.."

HOLD=.env.local.cf-hold
LOCK=.cf-sh.lock

# One run at a time: two runs would set .env.local aside and put it back
# over each other.
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "cf.sh: another run is active. If none is, remove $LOCK and retry." >&2
  if [ -f "$HOLD" ]; then
    echo "cf.sh: .env.local is set aside as $HOLD; the next run puts it back." >&2
  fi
  exit 1
fi
moved_env=no
linked_dev_vars=no
cleanup() {
  if [ "$moved_env" = yes ]; then mv -f "$HOLD" .env.local; fi
  if [ "$linked_dev_vars" = yes ]; then rm -f .dev.vars; fi
  rmdir "$LOCK"
}
trap cleanup EXIT

# A run that died without its EXIT trap leaves .env.local set aside: put it
# back. If a new .env.local was made since, only a person can tell which one
# is complete.
if [ -f "$HOLD" ]; then
  if [ -e .env.local ]; then
    echo "cf.sh: both .env.local and $HOLD exist: an interrupted run, then a new .env.local." >&2
    echo "cf.sh: keep the complete one as .env.local, delete the other, and retry." >&2
    exit 1
  fi
  mv "$HOLD" .env.local
fi

# Exports the values in the .env* files as process environment, parsed by
# @next/env (the loader `next build` uses) rather than evaluated as shell.
# Values already in the environment win, as they do for Next. CLOUDFLARE_*
# is skipped (trap 3).
export_build_env() {
  local kv
  while IFS= read -r -d '' kv; do export "$kv"; done < <(node -e '
    const preset = new Set(Object.keys(process.env));
    const nextPkg = require.resolve("next/package.json");
    const { loadEnvConfig } = require(require.resolve("@next/env", { paths: [nextPkg] }));
    const { parsedEnv } = loadEnvConfig(process.cwd(), false, { info() {}, error: console.error });
    for (const [key, value] of Object.entries(parsedEnv)) {
      if (!key.startsWith("CLOUDFLARE_") && !preset.has(key)) process.stdout.write(`${key}=${value}\0`);
    }
  ')
}

require_public_env() {
  local key
  local missing=""
  for key in $(grep -oE '^NEXT_PUBLIC_[A-Za-z0-9_]+' .env.example); do
    [ -n "${!key:-}" ] || missing="$missing $key"
  done
  if [ -n "$missing" ]; then
    echo "cf.sh: not set for the build:$missing" >&2
    echo "cf.sh: set them in .env.local, or as build variables in Workers Builds." >&2
    exit 1
  fi
}

# Fails when a non-public value is in the bundle, and when the file is not
# where OpenNext 1.20.6 writes it, so the check cannot pass by looking in
# the wrong place.
check_bundle() {
  node --input-type=module -e '
    import { existsSync } from "node:fs";
    const file = "./.open-next/cloudflare/next-env.mjs";
    if (!existsSync(file)) {
      console.error(`cf.sh: ${file} not found: nothing built yet, or OpenNext moved it.`);
      process.exit(1);
    }
    const modes = await import(file);
    const baked = [...new Set(Object.values(modes).flatMap((m) => Object.keys(m ?? {})))]
      .filter((key) => !key.startsWith("NEXT_PUBLIC_"));
    if (baked.length) {
      console.error(`cf.sh: server values compiled into the Worker bundle: ${baked.join(", ")}`);
      console.error("cf.sh: move them out of .env* files (Worker secrets in production, .dev.vars locally).");
      process.exit(1);
    }
  '
}

require_recent_build() {
  if [ -n "$(find .open-next/worker.js -mmin +30 2>/dev/null)" ]; then
    echo "cf.sh: .open-next was built more than 30 minutes ago. Rebuild first." >&2
    exit 1
  fi
}

case "$cmd" in
  build)
    if [ "$env" = preview ]; then
      # Build-time code (robots, metadata, next.config headers) sees the same
      # DEPLOY_ENV the Worker gets from its vars at runtime.
      export DEPLOY_ENV=preview
      export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://lisbon-project-preview.upfra-me.workers.dev}"
    fi
    # Margin stamps each comment with the commit it was made on
    # (<meta name="margin-version"> in app/(frontend)/layout.js). Every build,
    # since production carries Margin too while lp.lisboaux.com is the team's
    # review copy (lib/margin.js, 2026-10-08). Workers Builds provides the SHA.
    if [ -z "${MARGIN_VERSION:-}" ] && [ -n "${WORKERS_CI_COMMIT_SHA:-}" ]; then
      export MARGIN_VERSION="${WORKERS_CI_COMMIT_SHA:0:7}"
    fi
    export MARGIN_VERSION="${MARGIN_VERSION:-$(git rev-parse --short HEAD 2>/dev/null || echo unknown)}"
    if [ -f .env.local ]; then
      export_build_env
      mv .env.local "$HOLD"
      moved_env=yes
    fi
    require_public_env
    rm -rf .next/cache/fetch-cache
    # next.config.mjs switches on the Workers-only build tweaks.
    export NEXT_BUILD_TARGET=cloudflare
    pnpm exec opennextjs-cloudflare build
    check_bundle
    ;;
  preview)
    check_bundle
    # OpenNext starts wrangler dev with its .env loading turned off, so the
    # local Worker gets runtime values only from .dev.vars, and the build
    # has none compiled in. Point .dev.vars at .env.local while it runs.
    if [ ! -e .dev.vars ] && [ -f .env.local ]; then
      ln -s .env.local .dev.vars
      linked_dev_vars=yes
    fi
    pnpm exec opennextjs-cloudflare preview ${env:+--env "$env"}
    ;;
  deploy | upload)
    check_bundle
    require_recent_build
    if [ -f .env.local ]; then
      mv .env.local "$HOLD"
      moved_env=yes
    fi
    pnpm exec opennextjs-cloudflare "$cmd" ${env:+--env "$env"}
    ;;
esac
