// Support both the Next.js convention (NEXT_PUBLIC_*, used by the embedded
// /studio route and the read client) and the Sanity CLI convention
// (SANITY_STUDIO_*, used by `sanity deploy`), so one config serves both.
const rawProjectId =
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

export const apiVersion =
  process.env.SANITY_STUDIO_API_VERSION ||
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ||
  "2026-06-01";

export const dataset =
  process.env.SANITY_STUDIO_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "production";

// Fall back to a valid-looking placeholder so `next build` and the Studio shell
// compile before a real project exists; real network calls are gated on
// `isSanityConfigured`.
export const projectId = rawProjectId || "placeholder";

export const isSanityConfigured = Boolean(rawProjectId);
