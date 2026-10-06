import { SITE } from "./site";

// The site's editable text (the `site-text` Payload global): home hero and
// section headings, the "Visit us" block, the footer, and the organisation
// facts (address, phone, charity number). ONE field list drives every consumer:
//   - the global's fields + defaultValues (payload/globals/SiteText.ts),
//   - the /admin/site-text editor and its save validation,
//   - the review queue's Before/After diff (flatten-site-text.js),
//   - withSiteTextDefaults, which every public read goes through.
//
// Defaults are the text as shipped before it became editable, so a database
// without the global (or a bare styleguide render) looks exactly like before.
// Organisation facts default to lib/site.ts so there is one shipped value.

/**
 * @typedef {{ day: string, hours: string }} HoursRow
 * @typedef {"text" | "textarea" | "url" | "hours"} FieldKind
 * @typedef {{
 *   key: string, label: string, section: string, kind: FieldKind,
 *   required?: boolean, hint?: string, placeholder?: string,
 *   default: string | HoursRow[],
 * }} SiteTextField
 */

/** Editor sections, in page order. */
export const SITE_TEXT_SECTIONS = [
  { id: "hero", title: "Hero", description: "Top of the home page, above the Quick Access cards." },
  { id: "services", title: "Services section", description: "Heading above the grid of service categories on the home page." },
  { id: "contacts", title: "Contacts section", description: "Heading and subtitle above the External Contacts table." },
  { id: "visit", title: "Visit us", description: "The map block at the bottom of the home, category and article pages. The address and phone come from Organisation details." },
  { id: "footer", title: "Footer", description: "Bottom of every page. Leave a social link empty to hide its icon." },
  { id: "org", title: "Organisation details", description: "Used in the Visit us block, the footer, and the data search engines read about the organisation." },
];

// Social profiles as linked from lisbonproject.org (checked 2026-10-06).
const SOCIAL_DEFAULTS = {
  facebook: "https://www.facebook.com/lisbonprojectassociation",
  instagram: "https://www.instagram.com/lisbonprojectassociation",
  linkedin: "https://www.linkedin.com/company/lisbonprojectassociation",
  whatsapp: "https://www.whatsapp.com/channel/0029VafBNaFGk1Fk5kWxqQ1o",
};

/** @type {SiteTextField[]} */
export const SITE_TEXT_FIELDS = [
  // Hero
  { key: "heroTitle", label: "Title", section: "hero", kind: "text", required: true, default: "Admin Hub" },
  { key: "heroLead", label: "Lead", section: "hero", kind: "textarea", required: true, hint: "Bold line under the title.", default: "Connecting community members to external services and internal resources." },
  { key: "heroDescription", label: "Description", section: "hero", kind: "textarea", required: true, default: "Information platform summarizing the most common administrative processes, sharing tips and mapping external services." },
  // Home sections
  { key: "servicesTitle", label: "Title", section: "services", kind: "text", required: true, default: "Services and Information" },
  { key: "contactsTitle", label: "Title", section: "contacts", kind: "text", required: true, default: "External Contacts" },
  { key: "contactsSubtitle", label: "Subtitle", section: "contacts", kind: "text", required: true, default: "Key contact information across every service in Lisbon" },
  // Visit us
  { key: "visitTitle", label: "Address heading", section: "visit", kind: "text", required: true, default: "Where we are" },
  { key: "directionsTitle", label: "Directions heading", section: "visit", kind: "text", required: true, default: "How to Get Here" },
  { key: "metroLine", label: "Metro", section: "visit", kind: "text", hint: "Leave empty to hide.", default: "Metro: Linha Verde (Green Line) - Intendente Station" },
  { key: "busLine", label: "Bus", section: "visit", kind: "text", hint: "Leave empty to hide.", default: "Bus: 708, 730, 742, 794" },
  { key: "hoursTitle", label: "Opening hours heading", section: "visit", kind: "text", required: true, default: "Opening hours" },
  {
    key: "openingHours",
    label: "Opening hours",
    section: "visit",
    kind: "hours",
    default: [
      { day: "Mon, Tue, Thu", hours: "10:00–12:30 & 14:00–17:30" },
      { day: "Wednesday (Extended)", hours: "Until 19:30" },
      { day: "Friday", hours: "Until 18:30" },
    ],
  },
  { key: "hoursNote", label: "Note under the hours", section: "visit", kind: "text", hint: "Leave empty to hide.", default: "No appointment needed. Just walk in." },
  { key: "contactTitle", label: "Contact heading", section: "visit", kind: "text", required: true, default: "Contact info" },
  // Footer
  { key: "newsletterTitle", label: "Newsletter heading", section: "footer", kind: "text", required: true, default: "Newsletter" },
  { key: "newsletterBlurb", label: "Newsletter text", section: "footer", kind: "textarea", required: true, default: "Get monthly updates on events, programs, and community stories" },
  { key: "footerTagline", label: "Tagline", section: "footer", kind: "text", required: true, hint: "Follows “© year by Lisbon Project Association.”", default: "Building community, one connection at a time." },
  { key: "facebookUrl", label: "Facebook", section: "footer", kind: "url", placeholder: "https://www.facebook.com/…", default: SOCIAL_DEFAULTS.facebook },
  { key: "instagramUrl", label: "Instagram", section: "footer", kind: "url", placeholder: "https://www.instagram.com/…", default: SOCIAL_DEFAULTS.instagram },
  { key: "linkedinUrl", label: "LinkedIn", section: "footer", kind: "url", placeholder: "https://www.linkedin.com/company/…", default: SOCIAL_DEFAULTS.linkedin },
  { key: "whatsappUrl", label: "WhatsApp", section: "footer", kind: "url", placeholder: "https://www.whatsapp.com/channel/…", default: SOCIAL_DEFAULTS.whatsapp },
  // Organisation details
  { key: "addressStreet", label: "Street", section: "org", kind: "text", required: true, default: SITE.address.street },
  { key: "addressPostalCode", label: "Postal code", section: "org", kind: "text", required: true, default: SITE.address.postalCode },
  { key: "addressLocality", label: "City", section: "org", kind: "text", required: true, default: SITE.address.locality },
  { key: "phone", label: "Phone", section: "org", kind: "text", required: true, hint: "Shown as typed; the call link keeps only the digits and +.", default: "+351 964 809 959" },
  { key: "charityNumber", label: "Registered charity number", section: "org", kind: "text", required: true, default: SITE.charityNumber },
];

/** @typedef {Record<string, any>} SiteText */

/** Every field at its default. */
export const SITE_TEXT_DEFAULTS = /** @type {SiteText} */ (
  Object.fromEntries(SITE_TEXT_FIELDS.map((f) => [f.key, f.default]))
);

/** @param {unknown} rows @returns {HoursRow[]} */
function cleanHours(rows) {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((r) => ({ day: String(r?.day ?? "").trim(), hours: String(r?.hours ?? "").trim() }))
    .filter((r) => r.day || r.hours);
}

/**
 * A stored doc (possibly partial, possibly null) → complete site text.
 * - Required text: blank or missing falls back to the default, so the site
 *   never renders an empty heading.
 * - Optional text / links: a stored "" is respected (it hides that line or
 *   icon); only a missing value falls back.
 * - Opening hours: a stored list is used as-is (blank rows dropped).
 * @param {Record<string, any> | null | undefined} doc
 * @returns {SiteText}
 */
export function withSiteTextDefaults(doc) {
  /** @type {SiteText} */
  const out = {};
  for (const f of SITE_TEXT_FIELDS) {
    const v = doc?.[f.key];
    if (f.kind === "hours") {
      out[f.key] = Array.isArray(v) ? cleanHours(v) : f.default;
    } else if (f.required) {
      out[f.key] = typeof v === "string" && v.trim() ? v : f.default;
    } else {
      out[f.key] = typeof v === "string" ? v : f.default;
    }
  }
  return out;
}

/**
 * Validate + normalise what the editor sends. Returns the cleaned data, or an
 * error message for the first problem.
 * @param {Record<string, any>} data
 * @returns {{ ok: true, data: SiteText } | { ok: false, error: string }}
 */
export function validateSiteText(data) {
  /** @type {SiteText} */
  const out = {};
  for (const f of SITE_TEXT_FIELDS) {
    const v = data?.[f.key];
    if (f.kind === "hours") {
      out[f.key] = cleanHours(v);
      continue;
    }
    const s = typeof v === "string" ? v.trim() : "";
    if (f.required && !s) return { ok: false, error: `“${f.label}” needs some text.` };
    if (f.kind === "url" && s && !/^https?:\/\//i.test(s)) {
      return { ok: false, error: `${f.label} must be a full link starting with https://` };
    }
    out[f.key] = s;
  }
  return { ok: true, data: out };
}
