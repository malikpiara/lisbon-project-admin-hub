// Seed data for the /admin mock CMS. The /admin route keeps its own state
// (persisted to localStorage) separate from the public site's static data,
// the same way a real headless CMS separates drafts from published content.

import { getContacts, getService, listServiceSlugs } from "./services-data";

const serviceMeta = {
  "emergency-contacts": {
    shortDescription:
      "Help - 112, National Social Emergency - 144, Public Health Line - 800 242 424",
    tone: "rose",
    iconKey: "PhoneCall",
  },
  administration: {
    shortDescription:
      "Junta de Freguesia, Camara Municipal, NIF, Finanças, Loja do Cidadão, IRN, …",
    tone: "teal",
    iconKey: "Building2",
  },
  "education-training": {
    shortDescription:
      "Basic Education, Childcare, Conversion of Qualifications, …",
    tone: "violet",
    iconKey: "GraduationCap",
  },
  "family-child-support": {
    shortDescription:
      "Basic Education, Child Care, Family Reunification, Family Subsidies, …",
    tone: "pink",
    iconKey: "UsersRound",
  },
  "legal-assistance": {
    shortDescription: "Legal support, Trafficking & exploitation support",
    tone: "emerald",
    iconKey: "Scale",
  },
  "health-wellbeing": {
    shortDescription:
      "SNS, Health Center, European Healthcard, Cultural Shock and Homesickness, …",
    tone: "cyan",
    iconKey: "HeartPulse",
  },
  housing: {
    shortDescription:
      "Emergency housing support programmes, housing rights in Portugal",
    tone: "orange",
    iconKey: "Home",
  },
  immigration: {
    shortDescription:
      "Manifestation of interest, Residence Permit, Asylum Application Process, …",
    tone: "blue",
    iconKey: "IdCard",
  },
  "community-integration": {
    shortDescription:
      "Communities contacts, Cultural / recreational activities, …",
    tone: "violet",
    iconKey: "HandHeart",
  },
  transport: {
    shortDescription:
      "Public transportation passes, conversion of driver's license",
    tone: "cyan",
    iconKey: "Bus",
  },
  "disability-support": {
    shortDescription: "Support for people with disabilities / special needs",
    tone: "rose",
    iconKey: "Accessibility",
  },
  "legal-assistance-2": {
    shortDescription: "Legal support, Trafficking & exploitation support",
    tone: "blue",
    iconKey: "Scale",
  },
  "essential-support": {
    shortDescription:
      "Food insecurity, Material needs, Toilets, Laundry, Showers, Free STI Testing",
    tone: "violet",
    iconKey: "Package",
  },
  "gender-sexuality": {
    shortDescription: "LGBTQIA+",
    tone: "pink",
    iconKey: "Rainbow",
  },
};

export const defaultAdminData = {
  // One global contacts directory (see lib/services-data.js). Each contact is
  // tagged with the service categories it belongs to; the home "External Contacts"
  // table and every category page read from this same list.
  contacts: getContacts(),
  // The three shortcut cards of the Figma Home frame (3393:7186), copy and
  // glyphs as drawn. Production carries the same three (scripts/
  // quick-access-figma-content.ts applies this copy to them).
  quickAccess: [
    {
      id: "lp-website",
      title: "Lisbon Project",
      description: "Learn more about our initiatives",
      href: "https://lisbonproject.org",
      external: true,
      cta: "Visit Website",
      iconKey: "lp-house",
    },
    {
      id: "get-support",
      title: "Get Support",
      description: "Our Care team and Bridge team can help you",
      href: "/services/administration/social-care",
      external: false,
      cta: "Contact us",
      iconKey: "heart-partner",
    },
    {
      id: "emergency-contacts",
      title: "Emergency contacts",
      description: "Emergency support services in Lisbon.",
      href: "/services/health-wellbeing/emergency-contacts",
      external: false,
      cta: "Check information",
      iconKey: "emergency-contact",
    },
  ],
  services: listServiceSlugs().map((slug) => {
    const s = getService(slug);
    const meta = serviceMeta[slug] ?? {
      shortDescription: "",
      tone: "teal",
      iconKey: "Building2",
    };
    return {
      slug: s.slug,
      title: s.title,
      shortDescription: meta.shortDescription,
      intro: [...s.intro],
      tone: meta.tone,
      iconKey: meta.iconKey,
      contactsTitle: s.contactsTitle ?? `${s.title} Contacts`,
      contactsSubtitle:
        s.contactsSubtitle ??
        `Key contact information for ${s.title.toLowerCase()} services in Lisbon`,
      topics: s.topics.map((t) => ({ ...t })),
    };
  }),
};

export const toneOptions = [
  "rose",
  "teal",
  "violet",
  "pink",
  "emerald",
  "cyan",
  "orange",
  "blue",
];

// Category icon choices — canonical DS iconography names (the same set and
// names as /components/icons), curated down to category-appropriate glyphs
// (no social, brand-mark, or UI-chrome icons).
export const iconOptions = [
  "accessible",
  "backpack",
  "bridge",
  "briefcase-search",
  "building",
  "bus",
  "calendar-heart",
  "call-clock",
  "call-solo",
  "call-warning",
  "car",
  "certificate",
  "checklist",
  "child",
  "contact-book",
  "dining",
  "flag",
  "football",
  "gender",
  "gift",
  "globe",
  "hand",
  "hand-heart",
  "hand-key",
  "health-chart",
  "heart-check",
  "heart-cross",
  "heart-double",
  "heart-open",
  "home",
  "info",
  "landscape",
  "legal",
  "location",
  "metro",
  "notes",
  "organic-food",
  "partner",
  "partner-plus",
  "portugal",
  "report",
  "school",
  "shield",
  "star",
  "teaching",
  "tip",
  "user-heart",
  "users",
  "users-group",
  "users-heart",
  "users-laptop",
];

// Pre-DS icon keys still stored on existing services (lucide-era names mapped
// to DS glyphs in lib/service-icons.js). Kept valid in the Payload select so
// saving an untouched service doesn't fail validation; the picker no longer
// offers them.
export const legacyIconKeys = [
  "Phone",
  "PhoneCall",
  "Building2",
  "GraduationCap",
  "BookOpenText",
  "Heart",
  "Wallet",
  "HeartPulse",
  "Home",
  "FileText",
  "IdCard",
  "Shield",
  "HandHeart",
  "Bus",
  "Accessibility",
  "Scale",
  "Package",
  "Rainbow",
  "UsersRound",
];
