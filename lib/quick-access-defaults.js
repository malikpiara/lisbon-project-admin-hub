import { DONATE_URL } from "@/lib/site";

// What a Quick Access card's button says when its "Button label" is empty.
//
// Until October 2026 the label (and the icon) were hardcoded per link target in
// components/home/quick-access.jsx, so editing a card's link silently turned its
// button into "Learn more" — the team's "conteúdo dos botões editáveis" request.
// The label is a field now; this table only keeps the cards saved under the old
// regime saying what they always said. The admin editor shows the same fallback
// as the field's placeholder, so an empty field never hides what the site shows.
export const DEFAULT_CTA = "Learn more";

export const legacyCardMeta = {
  "/register": { cta: "Get Started" },
  // Donate always points at the main charity site, whatever the stored href.
  "/donate": { cta: "Donate Now", href: DONATE_URL, external: true },
  "https://lisbonproject.org": { cta: "Visit Website" },
  "/internal": { cta: "Open Portal" },
};

export function quickAccessCta(item) {
  return item?.cta?.trim() || legacyCardMeta[item?.href]?.cta || DEFAULT_CTA;
}
