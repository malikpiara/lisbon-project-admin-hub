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

// Recolours the whole Studio to match the public site / admin dashboard.
export const lisbonTheme = buildLegacyTheme({
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
