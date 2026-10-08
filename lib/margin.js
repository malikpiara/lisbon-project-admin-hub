// Margin, RoundTwenty's review layer: where its script tag and commit meta
// ship (app/(frontend)/layout.js) and where the CSP lets it in (next.config.mjs).
//
// The preview Worker always has it. lp.lisboaux.com has it too while that
// address is still the team's review copy (Malik, 2026-10-08): set
// MARGIN_ON_PRODUCTION to false at public launch. NODE_ENV keeps it out of
// `pnpm dev`: `next build` sets it to "production", dev does not.
// Visitors without a review link see nothing unless the round has a passcode,
// in which case Margin's curtain asks for it.

export const MARGIN_ORIGIN = "https://margin.roundtwenty.com";
export const MARGIN_ON_PRODUCTION = true;

/** @returns {boolean} */
export function marginOn() {
  return (
    process.env.DEPLOY_ENV === "preview" ||
    (MARGIN_ON_PRODUCTION && process.env.NODE_ENV === "production")
  );
}
