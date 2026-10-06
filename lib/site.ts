// Single source of truth for site-level SEO + structured data.
//
// Everything an SEO surface needs (metadataBase, sitemap, robots, JSON-LD) reads
// from here so the canonical host and the org facts are defined once. The org
// facts mirror what the public site already shows (site-footer, map-visit,
// privacy) — keep them in sync if the footer changes.
//
// The host is env-driven so the deployment can set its own domain without a code
// change (the platform is handed off — see the builder-relationship note). The
// fallback is the planned production subdomain; override with NEXT_PUBLIC_SITE_URL.

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://lp.lisboaux.com"
).replace(/\/$/, "");

// Donations are handled on the main charity site, not this admin-hub property.
// Every "Donate" CTA points here — one place to change the destination.
export const DONATE_URL = "https://www.lisbonproject.org/donate";

export const SITE = {
  /** Public-facing brand (logo/hero voice). */
  name: "The Lisbon Project",
  /** Registered legal entity (footer / privacy). */
  legalName: "Lisbon Project Association",
  description:
    "The Lisbon Project helps migrants and refugees feel at home in Portugal — mapping services, contacts and the most common administrative processes in Lisbon.",
  locale: "en",
  charityNumber: "PT514343575",
  telephone: "+351964809959",
  address: {
    street: "Rua Carvalho Araújo 66-B",
    postalCode: "1900-140",
    locality: "Lisboa",
    country: "PT",
  },
} as const;

/** Resolve a site-relative path to an absolute URL against the canonical host. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** The editable org facts (site-text global) that override the shipped ones. */
type OrgFacts = Partial<
  Record<
    | "phone"
    | "addressStreet"
    | "addressPostalCode"
    | "addressLocality"
    | "charityNumber"
    | "facebookUrl"
    | "instagramUrl"
    | "linkedinUrl"
    | "whatsappUrl",
    string
  >
>;

/**
 * The org as an NGO node. This is the anchor entity for search + AI answer
 * engines — it's what lets them attribute pages to "The Lisbon Project" and
 * surface the charity in results. `facts` (the site-text global) override the
 * shipped address/phone/charity number, so the page and the structured data
 * can't drift. `sameAs` lists only the social profiles the team has filled in
 * — never placeholders, which would hurt rather than help.
 */
export function organizationSchema(facts: OrgFacts = {}) {
  const sameAs = [
    facts.facebookUrl,
    facts.instagramUrl,
    facts.linkedinUrl,
    facts.whatsappUrl,
  ].filter((u): u is string => Boolean(u?.trim()));
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    "@id": `${SITE_URL}/#organization`,
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE_URL,
    logo: absoluteUrl("/lisbon-project-logo.svg"),
    description: SITE.description,
    telephone: facts.phone || SITE.telephone,
    address: {
      "@type": "PostalAddress",
      streetAddress: facts.addressStreet || SITE.address.street,
      postalCode: facts.addressPostalCode || SITE.address.postalCode,
      addressLocality: facts.addressLocality || SITE.address.locality,
      addressCountry: SITE.address.country,
    },
    areaServed: { "@type": "City", name: "Lisbon" },
    knowsLanguage: ["en", "pt"],
    identifier: facts.charityNumber || SITE.charityNumber,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** The site itself, linked back to the org. */
export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE.name,
    url: SITE_URL,
    inLanguage: SITE.locale,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

/** BreadcrumbList from an ordered list of {name, path} crumbs. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
