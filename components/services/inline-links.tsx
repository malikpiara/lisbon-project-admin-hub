import type { ReactNode } from "react";

// Markdown-style links [label](href) OR a bare http(s) URL.
const TOKEN_RE = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s<]+)/g;
// Only these targets become links; anything else (e.g. javascript:) stays text,
// so editor-authored content can't inject an unsafe link.
const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/)/i;

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

// Turn inline links inside a run of text into <a> elements, leaving the rest as
// plain text. Supports both `[text](url)` and pasted bare URLs. Returns an array
// of React nodes suitable for {renderInline(text)} inside any element.
export function renderInline(text: string, keyBase = "l"): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[3]) {
      // Bare URL: peel trailing punctuation back into the text stream so a URL
      // ending a sentence doesn't swallow the period/paren.
      let url = m[3];
      const trail = url.match(/[.,;:!?)\]]+$/);
      let tail = "";
      if (trail) {
        tail = trail[0];
        url = url.slice(0, -tail.length);
      }
      nodes.push(link(url, url, `${keyBase}-${m.index}`));
      if (tail) nodes.push(tail);
    } else {
      const href = (m[2] ?? "").trim();
      if (SAFE_HREF.test(href)) {
        nodes.push(link(href, m[1], `${keyBase}-${m.index}`));
      } else {
        nodes.push(m[0]); // unsafe href — keep the raw markdown as text
      }
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
