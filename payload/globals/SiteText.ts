import type { Field, GlobalConfig } from "payload";

import { SITE_TEXT_FIELDS } from "../../lib/site-text-defaults";
import { auditFields } from "../fields/audit";

// The site's editable text: home hero + section headings, the "Visit us"
// block, the footer, and the organisation facts. A global, not a collection —
// there is exactly one of each. The field list itself lives in
// lib/site-text-defaults.js, shared with the admin editor and the public reads.
//
// Drafts power the same review flow as Articles: editors save a draft
// ("submit for review"), admins publish directly and approve/decline pending
// drafts at /admin/review. Non-draft reads return the published text.
const fields: Field[] = SITE_TEXT_FIELDS.map((f): Field => {
  if (f.kind === "hours") {
    return {
      name: f.key,
      type: "array",
      defaultValue: f.default,
      fields: [
        { name: "day", type: "text" },
        { name: "hours", type: "text" },
      ],
    };
  }
  const defaultValue = f.default as string;
  return f.kind === "textarea"
    ? { name: f.key, type: "textarea", defaultValue }
    : { name: f.key, type: "text", defaultValue };
});

export const SiteText: GlobalConfig = {
  slug: "site-text",
  label: "Site text",
  // Public website content: anyone can read; writes still require auth.
  access: { read: () => true },
  versions: { drafts: true, max: 25 },
  admin: { group: "Content" },
  fields: [...fields, ...auditFields],
};
