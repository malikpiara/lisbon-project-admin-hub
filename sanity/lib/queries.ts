import { groq } from "next-sanity";

// All services with their embedded contacts and their (referenced) topics,
// in manual order. Topics are pulled via a reverse reference lookup.
export const servicesQuery = groq`
  *[_type == "service"] | order(order asc, title asc) {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    breadcrumb,
    intro,
    tone,
    iconKey,
    contactsTitle,
    contactsSubtitle,
    categoryFilters,
    contacts,
    "topics": *[_type == "topic" && references(^._id)] | order(order asc, title asc) {
      _id, title, "slug": slug.current, description, tone
    }
  }
`;

// One service by slug (same shape as a row of servicesQuery).
export const serviceBySlugQuery = groq`
  *[_type == "service" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    shortDescription,
    breadcrumb,
    intro,
    tone,
    iconKey,
    contactsTitle,
    contactsSubtitle,
    categoryFilters,
    contacts,
    "topics": *[_type == "topic" && references(^._id)] | order(order asc, title asc) {
      _id, title, "slug": slug.current, description, tone
    }
  }
`;

// One topic (with its full article) by service slug + topic slug.
export const topicBySlugQuery = groq`
  *[_type == "topic" && slug.current == $topic && service->slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    tone,
    "serviceSlug": service->slug.current,
    article
  }
`;

export const quickAccessQuery = groq`
  *[_type == "quickAccess"] | order(order asc) {
    _id, title, description, href, external
  }
`;
