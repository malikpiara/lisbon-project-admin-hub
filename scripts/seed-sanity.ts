/**
 * Seed a Sanity dataset from the project's existing seed data
 * (lib/admin-default-data.js + lib/article-defaults.js).
 *
 * Usage:
 *   1. Create a project + dataset (`npx sanity init`) and a write token at
 *      https://sanity.io/manage -> API -> Tokens (Editor).
 *   2. Put these in .env.local:
 *        NEXT_PUBLIC_SANITY_PROJECT_ID=...
 *        NEXT_PUBLIC_SANITY_DATASET=production
 *        SANITY_API_WRITE_TOKEN=...
 *   3. pnpm seed:sanity
 *
 * Idempotent: uses createOrReplace with deterministic _ids, so re-running
 * overwrites rather than duplicating.
 */
import { readFileSync } from "node:fs";

import { createClient } from "next-sanity";

import { defaultAdminData } from "../lib/admin-default-data.js";
import { defaultArticle } from "../lib/article-defaults.js";

// Minimal .env.local loader so `pnpm seed:sanity` works without extra deps.
try {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      let v = m[2].trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      process.env[m[1]] = v;
    }
  }
} catch {
  // no .env.local — fall back to the ambient environment
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-06-01";

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN.\n" +
      "See docs/CMS-EVALUATION.md (Sanity setup).",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const splitLines = (text) =>
  (text ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

function toArticle(topic) {
  const a = topic.article ?? defaultArticle(topic);
  return {
    heroLead: a.heroLead,
    faqLead: a.faqLead,
    sections: (a.sections ?? []).map((s, i) => ({
      _key: `sec-${i}`,
      _type: "articleSection",
      heading: s.heading,
      lead: s.lead,
      body: s.body,
      bullets: splitLines(s.bullets),
      ...(s.cta ? { cta: s.cta } : {}),
    })),
    faqs: (a.faqs ?? []).map((f, i) => ({
      _key: `faq-${i}`,
      _type: "faq",
      question: f.question,
      answer: f.answer,
    })),
  };
}

async function main() {
  const tx = client.transaction();

  defaultAdminData.services.forEach((s, si) => {
    const serviceId = `service-${s.slug}`;
    tx.createOrReplace({
      _id: serviceId,
      _type: "service",
      title: s.title,
      slug: { _type: "slug", current: s.slug },
      shortDescription: s.shortDescription,
      breadcrumb: s.breadcrumb,
      intro: s.intro,
      tone: s.tone,
      iconKey: s.iconKey,
      contactsTitle: s.contactsTitle,
      contactsSubtitle: s.contactsSubtitle,
      categoryFilters: s.categoryFilters,
      contacts: (s.contacts ?? []).map((c, i) => ({
        _key: `c-${i}`,
        _type: "contact",
        ...c,
      })),
      order: si,
    });

    (s.topics ?? []).forEach((t, ti) => {
      tx.createOrReplace({
        _id: `topic-${s.slug}-${t.slug}`,
        _type: "topic",
        title: t.title,
        slug: { _type: "slug", current: t.slug },
        service: { _type: "reference", _ref: serviceId },
        description: t.description,
        tone: t.tone,
        order: ti,
        article: toArticle(t),
      });
    });
  });

  defaultAdminData.quickAccess.forEach((q, qi) => {
    tx.createOrReplace({
      _id: `qa-${q.id}`,
      _type: "quickAccess",
      title: q.title,
      description: q.description,
      href: q.href,
      external: q.external,
      order: qi,
    });
  });

  const res = await tx.commit();
  console.log(`Seeded Sanity: ${res.results.length} documents written.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
