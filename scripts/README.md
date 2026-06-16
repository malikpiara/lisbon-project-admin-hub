# scripts/

## `ds-parity.mjs` — design-system parity check

A **read-only** audit that catches DS divergence in product code
*deterministically* — so inconsistencies can't be missed or eyeballed wrong.
Fitted to this project's Tailwind v4 `@theme` model (the DS vocabulary lives in
`app/globals.css`). It never modifies a file.

```bash
pnpm parity                        # node scripts/ds-parity.mjs
node scripts/ds-parity.mjs --json  # machine-readable (for CI / pre-commit)
```

Exit code is non-zero on any **fail**, so it works as a CI or pre-commit gate.

### Gates

| Gate | Catches |
|---|---|
| **A — Token value parity** *(optional)* | `globals.css` `--token` values vs a live Figma snapshot. Activates when `scripts/figma-tokens.snapshot.json` exists. |
| **B — Usage hygiene** | Raw Tailwind type sizes (`text-sm` → use `text-ds-*`), off-DS palette colours (`bg-red-500` → a DS token), `rounded-2xl/3xl` (cards are `rounded-lg`; panels use `rounded-[3.5rem]`), hardcoded hex in components. |
| **C — Orphaned tokens** | Every `--token` declared in `globals.css` is referenced somewhere. |

### Scope

Scans `app/` + `components/`. **Excludes** the `/components` DS gallery (it
renders raw demo values on purpose) and the Adamastor reference-calendar visuals
(`big-calendar*`, `category-filter` — exploratory, scoped out by the team). Token
maps (`admin-tones`, `ds-icons-data`, …) are exempt from the hex rule. Edit the
`isExcluded` / `KNOWN_UNUSED` lists at the top of the script to adjust.

### Gate A — refreshing the Figma snapshot

Gate A compares token *values*. To enable it, write
`scripts/figma-tokens.snapshot.json` as `{ "brand-500": "#1F8E87", … }` — keys are
the bare token name (the script prefixes `--` and maps `primitives/x/y` → `x-y`).
Populate it by pulling the DS variable values from Figma (via the Figma MCP
`get_variable_defs` or the REST API) and committing it as a tracked baseline.
Re-pull before each audit so you never check against a stale snapshot — that
"never audit a stale snapshot" guarantee is the core idea borrowed from the
tool below.

> Concept credit: [rms-parity](https://github.com/rafaelmatosds/rms-parity) by
> @rafaelmatosds. This is a lightweight, project-native take on its gate model —
> no submodule, no global install, no external token required for Gates B/C.
