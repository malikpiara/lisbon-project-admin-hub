// Seed data for the /admin mock CMS. The /admin route keeps its own state
// (persisted to localStorage) separate from the public site's static data,
// the same way a real headless CMS separates drafts from published content.

import { getService, listServiceSlugs } from "./services-data";

const serviceMeta = {
  "emergency-contacts": {
    shortDescription:
      "Help - 112, National Social Emergency - 144, Public Health Line - 800 242 424",
    tone: "rose",
    iconKey: "Phone",
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
    iconKey: "Heart",
  },
  "legal-assistance": {
    shortDescription: "Legal support, Trafficking & exploitation support",
    tone: "emerald",
    iconKey: "Wallet",
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
    iconKey: "FileText",
  },
  "community-integration": {
    shortDescription:
      "Communities contacts, Cultural / recreational activities, …",
    tone: "violet",
    iconKey: "Shield",
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
    iconKey: "Heart",
  },
};

export const defaultAdminData = {
  quickAccess: [
    {
      id: "register",
      title: "Get Support",
      description: "Register to access our platform",
      href: "/register",
      external: false,
    },
    {
      id: "donate",
      title: "Donate",
      description: "Help support our community work",
      href: "/donate",
      external: false,
    },
    {
      id: "lp-website",
      title: "Lisbon Project website",
      description: "Learn more about our initiatives",
      href: "https://lisbonproject.org",
      external: true,
    },
    {
      id: "internal",
      title: "Internal website",
      description: "Access internal resources",
      href: "/internal",
      external: false,
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
      breadcrumb: s.breadcrumb,
      intro: [...s.intro],
      tone: meta.tone,
      iconKey: meta.iconKey,
      contactsTitle: s.contactsTitle ?? `${s.title} Contacts`,
      contactsSubtitle:
        s.contactsSubtitle ??
        `Key contact information for ${s.title.toLowerCase()} services in Lisbon`,
      topics: s.topics.map((t) => ({ ...t })),
      contacts: s.contacts.map((c) => ({ ...c })),
      categoryFilters: [...s.categoryFilters],
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

export const iconOptions = [
  "Phone",
  "Building2",
  "GraduationCap",
  "Heart",
  "Wallet",
  "HeartPulse",
  "Home",
  "FileText",
  "Shield",
  "Bus",
  "Accessibility",
  "Scale",
  "Package",
];
