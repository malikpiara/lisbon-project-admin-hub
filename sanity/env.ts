export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-06-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const rawProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

// The Studio config and the read client both need a `projectId` at module-load
// time. Until a real project exists (`npx sanity init`), fall back to a
// syntactically-valid placeholder so `next build` and the Studio shell still
// compile. Anything that actually talks to Sanity is gated on
// `isSanityConfigured` so we never fire requests at a fake project.
export const projectId = rawProjectId || "placeholder";

export const isSanityConfigured = Boolean(rawProjectId);
