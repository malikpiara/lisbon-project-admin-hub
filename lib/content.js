import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";

import { withSiteTextDefaults } from "./site-text-defaults";
import { sectionBlocks } from "./section-blocks.js";

// Public content adapter — the single source the public site reads from.
//
// SERVER-ONLY: it imports the Payload config (and through it, the DB). Only
// import it from server components / route files, never from a "use client"
// module. It reads PUBLISHED content from Payload's Local API and maps each doc
// to the exact shape the presentational components expect, so the components
// stay dumb (props in, markup out) and the same shapes work in the styleguide.
//
// Every getter is wrapped in React.cache so a single request that needs, say,
// the service list in two places hits the DB once.

const getClient = cache(() => getPayload({ config }));

// Payload service doc → the shape the home grid, services index and category
// hero use. `intro` is stored as an array of { text }; flatten to string[].
function mapService(s) {
  return {
    slug: s.slug,
    title: s.title,
    shortDescription: s.shortDescription ?? "",
    intro: (s.intro ?? []).map((p) => p.text).filter(Boolean),
    tone: s.tone,
    iconKey: s.iconKey,
    contactsTitle: s.contactsTitle ?? "",
    contactsSubtitle: s.contactsSubtitle ?? "",
    order: s.order ?? 0,
  };
}

// Payload topic.article group → the shape ArticleView renders.
function mapArticle(a) {
  if (!a) return null;
  return {
    heroLead: a.heroLead ?? "",
    faqLead: a.faqLead ?? "",
    keyLinks: (a.keyLinks ?? []).map((l) => ({ label: l.label, href: l.href })),
    sections: (a.sections ?? []).map((s) => ({
      heading: s.heading,
      lead: s.lead ?? "",
      blocks: sectionBlocks(s),
    })),
    faqs: (a.faqs ?? []).map((f) => ({ question: f.question, answer: f.answer ?? "" })),
  };
}

// All service categories, in home-grid order.
export const getPublicServices = cache(async () => {
  const payload = await getClient();
  const { docs } = await payload.find({
    collection: "services",
    sort: "order",
    limit: 100,
    depth: 0,
  });
  return docs.map(mapService);
});

// One service + its published topics (light — no article bodies), for the
// category detail page. Returns null when the slug doesn't exist.
export const getPublicService = cache(async (slug) => {
  const payload = await getClient();
  const { docs } = await payload.find({
    collection: "services",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });
  const service = docs[0];
  if (!service) return null;
  const { docs: topics } = await payload.find({
    collection: "topics",
    // Published only: articles start life as drafts now, and a draft (or an
    // unpublished article) must not surface as a card.
    where: {
      and: [{ service: { equals: service.id } }, { _status: { equals: "published" } }],
    },
    sort: "order",
    limit: 200,
    depth: 0,
  });
  return {
    ...mapService(service),
    topics: topics.map((t) => ({
      slug: t.slug,
      title: t.title,
      description: t.description ?? "",
      tone: t.tone,
    })),
  };
});

// The whole global contacts directory. `categories` is a many-to-many to
// services; resolve it to service slugs (what ContactsSection filters on).
export const getPublicContacts = cache(async () => {
  const payload = await getClient();
  const { docs } = await payload.find({
    collection: "contacts",
    sort: "organization",
    limit: 500,
    depth: 1, // populate categories so we can read each service's slug
  });
  return docs.map((c) => ({
    id: String(c.id),
    organization: c.organization,
    service: c.service ?? "",
    phone: c.phone ?? "",
    email: c.email ?? "",
    categories: (c.categories ?? [])
      .map((cat) => (cat && typeof cat === "object" ? cat.slug : null))
      .filter(Boolean),
  }));
});

// One article (full body) + minimal parent service, for the article page.
export const getPublicTopic = cache(async (serviceSlug, topicSlug) => {
  const payload = await getClient();
  const { docs: sdocs } = await payload.find({
    collection: "services",
    where: { slug: { equals: serviceSlug } },
    limit: 1,
    depth: 0,
  });
  const service = sdocs[0];
  if (!service) return null;
  const { docs: tdocs } = await payload.find({
    collection: "topics",
    where: {
      and: [
        { service: { equals: service.id } },
        { slug: { equals: topicSlug } },
        { _status: { equals: "published" } },
      ],
    },
    limit: 1,
    depth: 0,
  });
  const topic = tdocs[0];
  if (!topic) return null;
  return {
    service: { slug: service.slug, title: service.title, iconKey: service.iconKey },
    topic: {
      slug: topic.slug,
      title: topic.title,
      description: topic.description ?? "",
      article: mapArticle(topic.article),
    },
  };
});

// Home-hero shortcut cards.
export const getPublicQuickAccess = cache(async () => {
  const payload = await getClient();
  const { docs } = await payload.find({
    collection: "quick-access",
    sort: "order",
    limit: 100,
    depth: 0,
  });
  return docs.map((q) => ({
    id: String(q.id),
    title: q.title,
    description: q.description ?? "",
    href: q.href,
    external: q.external ?? false,
    cta: q.cta ?? "",
    iconKey: q.iconKey ?? "",
  }));
});

// Site text (home hero + headings, Visit us block, footer, organisation facts),
// published version only. Any failure — including the `site-text` table not
// existing yet in a database the schema hasn't been pushed to — falls back to
// the shipped defaults, so no page can break on this read.
export const getPublicSiteText = cache(async () => {
  try {
    const payload = await getClient();
    const doc = await payload.findGlobal({
      slug: "site-text",
      depth: 0,
      draft: false,
    });
    return withSiteTextDefaults(doc);
  } catch (err) {
    console.error("[content] site text unavailable, using defaults:", err);
    return withSiteTextDefaults(null);
  }
});

// For generateStaticParams on /services/[slug].
export const listServiceSlugs = cache(async () => {
  const services = await getPublicServices();
  return services.map((s) => s.slug);
});

// For generateStaticParams on /services/[slug]/[topic] — every published
// topic paired with its parent service slug.
export const listTopicParams = cache(async () => {
  const payload = await getClient();
  const { docs: services } = await payload.find({
    collection: "services",
    limit: 100,
    depth: 0,
  });
  const slugById = Object.fromEntries(services.map((s) => [s.id, s.slug]));
  const { docs: topics } = await payload.find({
    collection: "topics",
    where: { _status: { equals: "published" } },
    limit: 1000,
    depth: 0,
  });
  return topics
    .map((t) => {
      const sid = t.service && typeof t.service === "object" ? t.service.id : t.service;
      const slug = slugById[sid];
      return slug ? { slug, topic: t.slug } : null;
    })
    .filter(Boolean);
});
