import type { GlobalConfig } from "payload";

import { HOME_PAGE_DEFAULTS } from "../../lib/home-page-defaults";
import { auditFields } from "../fields/audit";

// The home page's editable copy: hero text and the two section headings. A
// global, not a collection — there is exactly one home page.
//
// Drafts power the same review flow as Articles: editors save a draft
// ("submit for review"), admins publish directly and approve/decline pending
// drafts at /admin/review. Non-draft reads return the published copy.
export const HomePage: GlobalConfig = {
  slug: "home-page",
  label: "Home page",
  // Public website content: anyone can read; writes still require auth.
  access: { read: () => true },
  versions: { drafts: true, max: 25 },
  admin: { group: "Content" },
  fields: [
    { name: "heroTitle", type: "text", defaultValue: HOME_PAGE_DEFAULTS.heroTitle },
    { name: "heroLead", type: "textarea", defaultValue: HOME_PAGE_DEFAULTS.heroLead },
    {
      name: "heroDescription",
      type: "textarea",
      defaultValue: HOME_PAGE_DEFAULTS.heroDescription,
    },
    {
      name: "servicesTitle",
      type: "text",
      defaultValue: HOME_PAGE_DEFAULTS.servicesTitle,
    },
    {
      name: "contactsTitle",
      type: "text",
      defaultValue: HOME_PAGE_DEFAULTS.contactsTitle,
    },
    {
      name: "contactsSubtitle",
      type: "text",
      defaultValue: HOME_PAGE_DEFAULTS.contactsSubtitle,
    },
    ...auditFields,
  ],
};
