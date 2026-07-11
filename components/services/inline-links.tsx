import type { ReactNode } from "react";

// What becomes a link inside a run of body text, in priority order:
//   1. Markdown links   [label](href)
//   2. Bare http(s) URLs
//   3. Bare email addresses          → mailto:
//   4. Portuguese phone numbers      → tel:
// Alternation is ordered, so an email inside a markdown link (branch 1) is never
// re-matched by branch 3, and a phone's digits inside a URL never re-match.
const TOKEN_RE =
  /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s<]+)|([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|(\+?\d[\d\s().-]{7,}\d)/g;
// Only these targets become links; anything else (e.g. javascript:) stays text,
// so editor-authored content can't inject an unsafe link.
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/)/i;
// A label that is *exactly* an email address. Used to repair links whose href
// was mangled into a website — e.g. the "Add link" tool once turned
// jrs@jrsportugal.pt into [jrs@jrsportugal.pt](https://jrs@jrsportugal.pt).
const EMAIL_ONLY = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function link(href: string, label: ReactNode, key: string) {
  const external = /^https?:/i.test(href);
  return (
    <a
      key={key}
      href={href}
      className="font-bold text-primary underline"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {label}
    </a>
  );
}

// Validate a phone-ish run as a Portuguese number and return its tel: href, or
// null to leave the text untouched. Deliberately strict: PT numbers are 9 digits
// starting 2/3/9, optionally prefixed with +351 / 00351. Anything else (long
// reference numbers, amounts, other countries we can't be sure about) stays
// plain text — a wrong tel: link is worse than none for this audience.
function telHref(raw: string): string | null {
  let digits = raw.replace(/[^\d+]/g, "");
  let cc = "";
  if (digits.startsWith("+351")) {
    cc = "+351";
    digits = digits.slice(4);
  } else if (digits.startsWith("00351")) {
    cc = "+351";
    digits = digits.slice(5);
  } else if (digits.startsWith("351") && digits.length === 12) {
    // Country code written without a leading + (e.g. "351 965 063 268").
    cc = "+351";
    digits = digits.slice(3);
  } else if (digits.startsWith("+")) {
    return null; // some other country — don't guess
  }
  if (!/^[239]\d{8}$/.test(digits)) return null;
  return `tel:${cc || "+351"}${digits}`;
}

// Turn inline links inside a run of text into <a> elements, leaving the rest as
// plain text. Returns an array of React nodes suitable for {renderInline(text)}
// inside any element.
export function renderInline(text: string, keyBase = "l"): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const key = `${keyBase}-${m.index}`;
    if (m[1] !== undefined && m[2] !== undefined) {
      // Markdown link. If the visible text is an email, always link it as a
      // mailto: — this fixes content whose stored href points at a website.
      const label = m[1];
      let href = m[2].trim();
      if (EMAIL_ONLY.test(label.trim()) && !/^mailto:/i.test(href)) {
        href = `mailto:${label.trim()}`;
      }
      nodes.push(SAFE_HREF.test(href) ? link(href, label, key) : m[0]);
    } else if (m[3]) {
      // Bare URL: peel trailing punctuation back into the text stream so a URL
      // ending a sentence doesn't swallow the period/paren.
      let url = m[3];
      const trail = url.match(/[.,;:!?)\]]+$/);
      let tail = "";
      if (trail) {
        tail = trail[0];
        url = url.slice(0, -tail.length);
      }
      nodes.push(link(url, url, key));
      if (tail) nodes.push(tail);
    } else if (m[4]) {
      // Bare email address.
      nodes.push(link(`mailto:${m[4]}`, m[4], key));
    } else if (m[5]) {
      // Phone-ish run — link it only if it parses as a PT number.
      const href = telHref(m[5]);
      nodes.push(href ? link(href, m[5], key) : m[5]);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
