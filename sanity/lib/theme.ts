import { buildLegacyTheme } from "sanity";

// Lisbon Project palette, pulled from the brand ramp in app/globals.css.
const brand = {
  white: "#ffffff",
  ink: "#0A2422", // brand-900 — near-black green for text
  navy: "#071817", // brand-1000 — Studio top nav
  green: "#1F8E87", // brand-500 — primary
  greenDeep: "#0D635D", // brand-600 — the signature brand green
  gray: "#5b6b69",
};

// Heading/sans font, matching the public site (--font-quicksand in globals.css).
// The font itself is loaded in app/(studio)/layout.tsx.
const quicksand =
  'Quicksand, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

// Recolours the whole Studio to match the public site / admin dashboard.
const base = buildLegacyTheme({
  "--black": brand.ink,
  "--white": brand.white,
  "--gray": brand.gray,
  "--gray-base": brand.gray,

  "--component-bg": brand.white,
  "--component-text-color": brand.ink,

  "--brand-primary": brand.greenDeep,

  "--default-button-color": brand.gray,
  "--default-button-primary-color": brand.greenDeep,
  "--default-button-success-color": brand.green,
  "--default-button-warning-color": "#C98A00",
  "--default-button-danger-color": "#C0362C",

  "--state-info-color": brand.greenDeep,
  "--state-success-color": brand.green,
  "--state-warning-color": "#C98A00",
  "--state-danger-color": "#C0362C",

  "--main-navigation-color": brand.navy,
  "--main-navigation-color--inverted": brand.white,

  "--focus-color": brand.greenDeep,
});

// Layer the brand font on top of the colour theme (legacy theme is colours-only).
// Cast back to the theme type: spreading widens `fonts.code` to optional, but
// the runtime shape is unchanged (only the `family` strings differ).
const f = base.fonts!;
export const lisbonTheme = {
  ...base,
  fonts: {
    ...f,
    heading: { ...f.heading, family: quicksand },
    text: { ...f.text, family: quicksand },
    label: { ...f.label, family: quicksand },
  },
} as typeof base;
