// Prototype data for service category detail pages.
// Each entry corresponds to one of the cards in the home Services and Information grid.

const familyChildSupport = {
  slug: "family-child-support",
  title: "Family and childcare",
  breadcrumb: "Family and childcare",
  contactsTitle: "Family and Childcare Contacts",
  contactsSubtitle: "Key contact information for family and childcare services in Lisbon",
  intro: [
    "Connecting community members to external services and internal resources.",
    "Information platform summarizing the most common administrative processes, sharing tips and mapping external services.",
  ],
  topics: [
    {
      slug: "basic-education",
      title: "Basic Education",
      description:
        "Lorem ipsum dolor sit amet consectetur. Risus id posuere ornare proin gravida egestas dictumst diam.",
      tone: "rose",
    },
    {
      slug: "child-care",
      title: "Child Care",
      description:
        "Lorem ipsum dolor sit amet consectetur. Risus id posuere ornare proin.",
      tone: "violet",
    },
    {
      slug: "family-reunification",
      title: "Family Reunification",
      description:
        "Lorem ipsum dolor sit amet consectetur. Risus id posuere ornare proin.",
      tone: "violet",
    },
    {
      slug: "family-subsides",
      title: "Family Subsides",
      description:
        "Lorem ipsum dolor sit amet consectetur. Risus id posuere ornare proin.",
      tone: "pink",
    },
    {
      slug: "creche-feliz-program",
      title: "Creche Feliz Program",
      description:
        "Lorem ipsum dolor sit amet consectetur. Cursus ornare non se.",
      tone: "emerald",
    },
    {
      slug: "support-single-mothers",
      title: "Support for Single Mothers",
      description:
        "Lorem ipsum dolor sit amet consectetur. Risus id posuere proin.",
      tone: "cyan",
    },
    {
      slug: "instituto-apoio-crianca",
      title: "Instituto de Apoio à Criança",
      description:
        "Lorem ipsum dolor sit amet consectetur. Risus id posuere ornare proin gravida egestas dictumst diam.",
      tone: "orange",
    },
    {
      slug: "children-special-needs",
      title: "Children with Special Needs",
      description:
        "Lorem ipsum dolor sit amet consectetur. Risus id posuere proin.",
      tone: "blue",
    },
    {
      slug: "family-mediation",
      title: "Family Mediation",
      description:
        "Lorem ipsum dolor sit amet consectetur. Risus id posuere ornare proin.",
      tone: "violet",
    },
    {
      slug: "parenting-tips",
      title: "Parenting Tips",
      description:
        "Lorem ipsum dolor sit amet consectetur. Risus id posuere ornare proin.",
      tone: "pink",
    },
  ],
  categoryFilters: [
    "Family Support",
    "Childcare",
    "Government Services",
    "Child Protection",
    "Healthcare",
    "Municipal Services",
    "Special Needs",
    "Family Mediation",
    "Parent Support",
    "Information & Resources",
    "Mental Health",
    "Integration Services",
  ],
  contacts: [
    {
      organization: "Centro de Apoio Familiar",
      service: "Family counseling and support services",
      phone: "+351 21 123 4567",
      email: "info@caf.pt",
      category: "Family Support",
    },
    {
      organization: "Creche Municipal de Benfica",
      service: "Public childcare for ages 0-3",
      phone: "+351 21 234 5678",
      email: "creche.benfica@cm-lisboa.pt",
      category: "Childcare",
    },
    {
      organization: "Segurança Social - Centro Distrital",
      service: "Family benefits and subsidies",
      phone: "+351 21 345 6789",
      email: "atendimento@seg-social.pt",
      category: "Government Services",
    },
    {
      organization: "Instituto de Apoio à Criança",
      service: "Child protection and advocacy",
      phone: "+351 21 456 7890",
      email: "contacto@iac.pt",
      category: "Child Protection",
    },
    {
      organization: "Centro de Saúde Familiar",
      service: "Family health and pediatric care",
      phone: "+351 21 567 8901",
      email: "saude.familia@sns.pt",
      category: "Healthcare",
    },
    {
      organization: "Câmara Municipal - Divisão Familiar",
      service: "Municipal family services and programs",
      phone: "+351 21 678 9012",
      email: "familia@cm-lisboa.pt",
      category: "Municipal Services",
    },
    {
      organization: "Centro de Educação Especial",
      service: "Special needs education and support",
      phone: "+351 21 789 0123",
      email: "info@cee.pt",
      category: "Special Needs",
    },
    {
      organization: "Mediação Familiar de Lisboa",
      service: "Family mediation and conflict resolution",
      phone: "+351 21 890 1234",
      email: "mediacao@mfl.pt",
      category: "Family Mediation",
    },
    {
      organization: "Associação de Pais e Educadores",
      service: "Parent support groups and resources",
      phone: "+351 21 901 2345",
      email: "pais@ape.pt",
      category: "Parent Support",
    },
    {
      organization: "Centro de Recursos Familiares",
      service: "Information and referral services",
      phone: "+351 21 012 3456",
      email: "recursos@crf.pt",
      category: "Information & Resources",
    },
    {
      organization: "Serviço de Psicologia Familiar",
      service: "Family therapy and counseling",
      phone: "+351 21 123 4568",
      email: "psicologia@spf.pt",
      category: "Mental Health",
    },
    {
      organization: "Centro de Integração Familiar",
      service: "Integration support for immigrant families",
      phone: "+351 21 234 5679",
      email: "integracao@cif.pt",
      category: "Integration Services",
    },
    {
      organization: "Programa Creche Feliz",
      service: "Free childcare program assistance",
      phone: "+351 21 345 6780",
      email: "crechefeliz@gov.pt",
      category: "Childcare",
    },
    {
      organization: "Apoio a Mães Solteiras",
      service: "Support services for single mothers",
      phone: "+351 21 456 7891",
      email: "maes@apoio.pt",
      category: "Family Support",
    },
    {
      organization: "Centro de Acolhimento Infantil",
      service: "Emergency child shelter and care",
      phone: "+351 21 567 8902",
      email: "acolhimento@cai.pt",
      category: "Child Protection",
    },
  ],
};

// Service categories from the home grid that don't yet have full data
// get a stubbed shell so the route at least renders during the prototype phase.
const stubTitles = {
  "emergency-contacts": "Emergency contacts",
  administration: "Administration",
  "education-training": "Education and Training",
  "legal-assistance": "Legal assistance",
  "health-wellbeing": "Health and Well-being",
  housing: "Housing",
  immigration: "Immigration",
  "community-integration": "Community and integration",
  transport: "Transport",
  "disability-support": "Disability Support",
  "legal-assistance-2": "Legal assistance",
  "essential-support": "Essential Support",
  "gender-sexuality": "Gender and Sexuality",
};

// During the prototype phase every category reuses the family/childcare
// dataset so each route renders a fully populated page.
function makeStub(slug) {
  const title = stubTitles[slug] ?? slug;
  return {
    slug,
    title,
    breadcrumb: title,
    intro: familyChildSupport.intro,
    topics: familyChildSupport.topics,
    categoryFilters: familyChildSupport.categoryFilters,
    contacts: familyChildSupport.contacts,
    contactsTitle: `${title} Contacts`,
    contactsSubtitle: `Key contact information for ${title.toLowerCase()} services in Lisbon`,
    placeholder: true,
  };
}

// Display order matches the original Figma home grid.
const orderedSlugs = [
  "emergency-contacts",
  "administration",
  "education-training",
  "family-child-support",
  "legal-assistance",
  "health-wellbeing",
  "housing",
  "immigration",
  "community-integration",
  "transport",
  "disability-support",
  "legal-assistance-2",
  "essential-support",
  "gender-sexuality",
];

const allServices = Object.fromEntries(
  orderedSlugs.map((slug) => [
    slug,
    slug === "family-child-support" ? familyChildSupport : makeStub(slug),
  ]),
);

export function getService(slug) {
  return allServices[slug];
}

export function listServiceSlugs() {
  return Object.keys(allServices);
}
