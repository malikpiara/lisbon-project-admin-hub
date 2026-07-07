/**
 * Seed the local Payload (SQLite) database from the project's existing seed
 * data (lib/admin-default-data.js + lib/article-defaults.js).
 *
 * Usage:
 *   1. Set PAYLOAD_SECRET and DATABASE_URI in .env.local (DATABASE_URI
 *      defaults to file:./payload.db).
 *   2. pnpm seed:payload
 *
 * Idempotent: clears the content collections first, then recreates everything.
 * Also creates a first admin user (PAYLOAD_SEED_EMAIL / PAYLOAD_SEED_PASSWORD,
 * defaults admin@example.com / changeme123) if none exists.
 *
 * Env is loaded manually below, then the Payload config is imported
 * *dynamically* — the config reads process.env at module load, so the env must
 * be in place first.
 */
import { readFileSync } from "node:fs";

import { defaultAdminData } from "../lib/admin-default-data.js";
import { defaultArticle } from "../lib/article-defaults.js";

// --- load .env.local then .env (first definition wins) ---
for (const file of [".env.local", ".env"]) {
  try {
    const raw = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
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
    // file absent — rely on ambient env
  }
}

if (!process.env.PAYLOAD_SECRET) {
  console.error("Missing PAYLOAD_SECRET. See docs/archive/CMS-EVALUATION.md.");
  process.exit(1);
}

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
    sections: (a.sections ?? []).map((s) => ({
      heading: s.heading,
      lead: s.lead,
      body: s.body,
      bullets: splitLines(s.bullets).map((text) => ({ text })),
      ...(s.cta ? { cta: s.cta } : {}),
    })),
    keyLinks: (a.keyLinks ?? []).map((l) => ({
      label: l.label,
      href: l.href,
    })),
    faqs: (a.faqs ?? []).map((f) => ({
      question: f.question,
      answer: f.answer,
    })),
  };
}

// Import after env is set (config reads process.env at load time).
const { getPayload } = await import("payload");
const { default: config } = await import("@payload-config");

const payload = await getPayload({ config });

// Clear content collections (match-all where) so reseeding is idempotent.
const all = { id: { exists: true } };
for (const collection of ["topics", "services", "quick-access"] as const) {
  await payload.delete({ collection, where: all });
}

for (const [si, s] of defaultAdminData.services.entries()) {
  const service = await payload.create({
    collection: "services",
    data: {
      title: s.title,
      slug: s.slug,
      shortDescription: s.shortDescription,
      breadcrumb: s.breadcrumb,
      intro: (s.intro ?? []).map((text) => ({ text })),
      tone: s.tone,
      iconKey: s.iconKey,
      contactsTitle: s.contactsTitle,
      contactsSubtitle: s.contactsSubtitle,
      categoryFilters: (s.categoryFilters ?? []).map((value) => ({ value })),
      contacts: (s.contacts ?? []).map((c) => ({ ...c })),
      order: si,
    },
  });

  for (const [ti, t] of (s.topics ?? []).entries()) {
    await payload.create({
      collection: "topics",
      data: {
        title: t.title,
        slug: t.slug,
        service: service.id,
        description: t.description,
        tone: t.tone,
        order: ti,
        article: toArticle(t),
      },
    });
  }
}

for (const [qi, q] of defaultAdminData.quickAccess.entries()) {
  await payload.create({
    collection: "quick-access",
    data: {
      title: q.title,
      description: q.description,
      href: q.href,
      external: q.external,
      order: qi,
    },
  });
}

const email = process.env.PAYLOAD_SEED_EMAIL || "admin@example.com";
const password = process.env.PAYLOAD_SEED_PASSWORD || "changeme123";
const users = await payload.find({ collection: "users", limit: 1 });
if (users.totalDocs === 0) {
  await payload.create({
    collection: "users",
    data: { email, password, name: "Admin", role: "admin" },
  });
  console.log(`Created admin user: ${email} / ${password}`);
}

const counts = await Promise.all(
  ["services", "topics", "quick-access"].map(async (c) => {
    const r = await payload.count({ collection: c });
    return `${c}: ${r.totalDocs}`;
  }),
);
console.log(`Payload seed complete — ${counts.join(", ")}.`);
process.exit(0);
