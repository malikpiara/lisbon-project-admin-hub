// A contact's channels, in one normalised shape for the public table, the
// admin editor and the seed. Pure, no Payload import.
//
// Since October 2026 (Rafael's contacts layout) an organisation can have
// several phones, emails, websites and social profiles — each rendered as one
// icon link, hidden when empty. The single `phone` / `email` columns from
// before are read as a one-item list until the contact is saved again, so
// nothing needs migrating.

export const SOCIAL_NETWORKS = ["instagram", "facebook", "linkedin", "whatsapp", "other"];
export const SOCIAL_LABELS = {
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
  other: "Other",
};

const clean = (v) => (v == null ? "" : String(v).trim());
const isUrl = (v) => /^https?:\/\//i.test(v);
const lastSegment = (url) => url.replace(/[?#].*$/, "").replace(/\/+$/, "").split("/").pop() || url;

/**
 * @typedef {{ number: string, label: string }} Phone
 * @typedef {{ url: string, label: string }} Website
 * @typedef {{ network: string, handle: string }} Social
 * @typedef {{ phones: Phone[], emails: string[], websites: Website[], socials: Social[] }} Channels
 */

/**
 * Payload contact doc (either stored shape) → Channels.
 * @param {any} doc
 * @returns {Channels}
 */
export function contactChannels(doc) {
  const phones = (doc?.phones ?? [])
    .map((p) => ({ number: clean(p?.number), label: clean(p?.label) }))
    .filter((p) => p.number);
  if (!phones.length && clean(doc?.phone)) phones.push({ number: clean(doc.phone), label: "" });
  const emails = (doc?.emails ?? []).map((e) => clean(e?.address)).filter(Boolean);
  if (!emails.length && clean(doc?.email)) emails.push(clean(doc.email));
  const websites = (doc?.websites ?? [])
    .map((w) => ({ url: clean(w?.url), label: clean(w?.label) }))
    .filter((w) => w.url);
  const socials = (doc?.socials ?? [])
    .map((s) => ({
      network: SOCIAL_NETWORKS.includes(s?.network) ? s.network : "other",
      handle: clean(s?.handle),
    }))
    .filter((s) => s.handle);
  return { phones, emails, websites, socials };
}

/** tel: link — digits and a leading + only, so it dials; the label keeps the formatting. */
export function telHref(number) {
  return `tel:${clean(number).replace(/[^\d+]/g, "")}`;
}

/** @param {Website} w */
export function websiteLink(w) {
  const url = clean(w?.url);
  const href = isUrl(url) ? url : `https://${url}`;
  const label = clean(w?.label) || url.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  return { href, label };
}

/**
 * A social profile as typed by an editor — "@handle", a bare handle, a
 * number (WhatsApp) or a full URL — → where it links and what it says.
 * @param {Social} s
 */
export function socialLink(s) {
  const h = clean(s?.handle);
  const bare = h.replace(/^@/, "");
  switch (s?.network) {
    case "instagram":
      return isUrl(h)
        ? { href: h, label: `@${lastSegment(h)}` }
        : { href: `https://instagram.com/${bare}`, label: `@${bare}` };
    case "facebook":
      return isUrl(h) ? { href: h, label: lastSegment(h) } : { href: `https://facebook.com/${bare}`, label: bare };
    case "linkedin":
      return isUrl(h)
        ? { href: h, label: lastSegment(h) }
        : { href: `https://www.linkedin.com/company/${bare}`, label: bare };
    case "whatsapp":
      return isUrl(h)
        ? { href: h, label: h.replace(/^https?:\/\//i, "") }
        : { href: `https://wa.me/${h.replace(/\D/g, "")}`, label: h };
    default:
      return websiteLink({ url: h, label: "" });
  }
}
