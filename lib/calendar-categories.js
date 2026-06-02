// Single source of truth for calendar event categories (Option A: title prefix).
//
// Managers tag an event by prefixing its title with a category and a colon:
//
//     "Employability: AI Tools Workshop"  ->  category "Employability"
//
// The part before the colon is matched (case-insensitively, ignoring spaces)
// against `label` or any `aliases` below. On a match we strip the prefix so the
// public sees a clean title ("AI Tools Workshop") while we keep the category
// internally. Anything that doesn't match a known category falls through to
// "Uncategorised" — events are never dropped, just left untagged so they stay
// visible (and fixable) via the Uncategorised filter.
//
// Why this shape: the category lives inside the title the editor is already
// typing, so it can't drift from the event the way a separate mapping would.
// Resolution is isolated to `resolveCategory()` — if we ever switch the source
// of truth (e.g. event colour, or one calendar per category), only that one
// function changes; the filter UI and styling stay put.

export const CATEGORIES = [
  {
    id: "education",
    label: "Education",
    color: "#2563eb", // blue
    aliases: ["training", "courses", "course", "classes"],
  },
  {
    id: "employability",
    label: "Employability",
    color: "#d97706", // amber
    aliases: ["jobs", "employment", "work", "careers"],
  },
  {
    id: "social-care",
    label: "Social Care",
    color: "#e11d48", // rose
    aliases: ["social", "care", "wellbeing", "well-being", "health"],
  },
  {
    id: "community-life",
    label: "Community Life",
    color: "#059669", // emerald
    aliases: ["community", "community life", "social life"],
  },
  {
    id: "people-culture",
    label: "People & Culture",
    color: "#7c3aed", // violet
    aliases: ["people and culture", "people", "culture", "volunteers", "volunteering"],
  },
];

// Fallback bucket for events whose title has no recognised category prefix.
export const UNCATEGORISED = { id: "uncategorised", label: "Uncategorised", color: "#64748b" };

// label + every alias -> category, all lowercased, for forgiving matching.
const LOOKUP = (() => {
  const map = new Map();
  for (const c of CATEGORIES) {
    map.set(c.label.toLowerCase(), c);
    for (const a of c.aliases ?? []) map.set(a.toLowerCase(), c);
  }
  return map;
})();

// "<prefix>: <rest>" — colon only (a hyphen would mangle titles like
// "Co-working Day"). Prefix is 2–40 non-colon chars; rest must be non-empty.
const PREFIX_RE = /^\s*([^:]{2,40}):\s*(.+)$/s;

/**
 * Resolve an event title to a category id + a clean display title.
 * Only strips the prefix when it matches a known category, so titles like
 * "Reminder: bring documents" are left completely untouched.
 *
 * @param {string} title raw event summary from Google Calendar
 * @returns {{ categoryId: string, displayTitle: string }}
 */
export function resolveCategory(title) {
  const match = title?.match(PREFIX_RE);
  if (match) {
    const category = LOOKUP.get(match[1].trim().toLowerCase());
    if (category) {
      return { categoryId: category.id, displayTitle: match[2].trim() };
    }
  }
  return { categoryId: UNCATEGORISED.id, displayTitle: (title ?? "").trim() };
}

/** Look up a category (or the Uncategorised fallback) by id, for rendering. */
export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) ?? UNCATEGORISED;
}
