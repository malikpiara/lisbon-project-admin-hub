// The home page's editable copy, as shipped before it became editable. Three
// consumers, so the text exists once:
//   - the `home-page` Payload global's defaultValues (what /cms-admin shows),
//   - lib/content.js, which falls back to these per field when the global is
//     blank or unreadable (e.g. before its table exists in a database),
//   - the components' default props (the styleguide renders them bare).
export const HOME_PAGE_DEFAULTS = {
  heroTitle: "Admin Hub",
  heroLead:
    "Connecting community members to external services and internal resources.",
  heroDescription:
    "Information platform summarizing the most common administrative processes, sharing tips and mapping external services.",
  servicesTitle: "Services and Information",
  contactsTitle: "External Contacts",
  contactsSubtitle: "Key contact information across every service in Lisbon",
};

/** @typedef {typeof HOME_PAGE_DEFAULTS} HomePageCopy */

// Field order = the order they appear on the page. The admin editor, the
// review diff and the merge below all walk this list.
export const HOME_PAGE_FIELDS = /** @type {(keyof HomePageCopy)[]} */ (
  Object.keys(HOME_PAGE_DEFAULTS)
);

/**
 * A stored doc (possibly partial, possibly null) → complete copy. Blank or
 * missing fields fall back to the default, so the page never renders an empty
 * heading.
 * @param {Partial<Record<string, unknown>> | null | undefined} doc
 * @returns {HomePageCopy}
 */
export function withHomePageDefaults(doc) {
  const out = { ...HOME_PAGE_DEFAULTS };
  for (const key of HOME_PAGE_FIELDS) {
    const v = doc?.[key];
    if (typeof v === "string" && v.trim()) out[key] = v;
  }
  return out;
}
