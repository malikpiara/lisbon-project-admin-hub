import type { ReactNode } from "react";

import { renderInline } from "@/components/services/inline-links";
import { cn } from "@/lib/utils";

// PROTOTYPE (2026-10, team feedback): a tiny, forgiving text format for the
// plain textareas editors already use. No new editor, no stored HTML — the same
// strings keep rendering, they just gain structure:
//
//   blank line          → new paragraph           (as before)
//   single Enter        → line break              (was silently collapsed)
//   "- item" / "• item" → bulleted list
//   "1. step"           → numbered list
//   **bold**            → <strong>
//   [label](https://…)  → link                    (as before, inline-links.tsx)
//
// Why this and not a rich-text editor: 54% of the 351 live text blocks already
// contain a single Enter that the site drops, 22 have hand-typed "1." steps and
// 10 hand-typed bullets — editors are writing this format *today*, into a box
// that ignores it. Honouring it costs nothing in data migration and nothing in
// the editor, and a Lexical/HTML editor can still land later (its output would
// need a different renderer, not a different data model for these fields).

const BULLET_RE = /^\s*[-•*]\s+(.*)$/;
const NUMBER_RE = /^\s*\d+[.)]\s+(.*)$/;
const BOLD_RE = /\*\*([^*\n]+?)\*\*/g;

// Inline pass: **bold** first, links inside each run after.
export function renderInlineRich(text: string, keyBase = "r"): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  BOLD_RE.lastIndex = 0;
  while ((m = BOLD_RE.exec(text)) !== null) {
    if (m.index > last)
      out.push(...renderInline(text.slice(last, m.index), `${keyBase}-${last}`));
    out.push(
      <strong key={`${keyBase}-b-${m.index}`} className="font-bold">
        {renderInline(m[1], `${keyBase}-bi-${m.index}`)}
      </strong>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length)
    out.push(...renderInline(text.slice(last), `${keyBase}-${last}`));
  return out;
}

type Block =
  | { kind: "p"; lines: string[] }
  | { kind: "list"; ordered: boolean; items: string[] };

// Group lines into paragraphs and lists. A list item line opens (or extends) a
// list; a blank line ends whatever is open; any other line extends the current
// paragraph (so a single Enter is a <br>, not a new paragraph).
export function parseRichText(text: string): Block[] {
  const blocks: Block[] = [];
  let cur: Block | null = null;
  for (const raw of (text ?? "").split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) {
      cur = null;
      continue;
    }
    const bullet = line.match(BULLET_RE);
    const number = bullet ? null : line.match(NUMBER_RE);
    if (bullet || number) {
      const ordered = !!number;
      const item = (bullet ?? number)![1].trim();
      if (cur && cur.kind === "list" && cur.ordered === ordered) {
        cur.items.push(item);
      } else {
        cur = { kind: "list", ordered, items: [item] };
        blocks.push(cur);
      }
      continue;
    }
    if (cur && cur.kind === "p") {
      cur.lines.push(line.trim());
    } else {
      cur = { kind: "p", lines: [line.trim()] };
      blocks.push(cur);
    }
  }
  return blocks;
}

export const listClass = (ordered: boolean) =>
  cn(
    "space-y-1 pl-6",
    // Step numbers read as the step's label (team ask: bold, a touch larger);
    // bullets stay quiet.
    ordered
      ? "list-decimal marker:text-ds-s marker:font-bold marker:text-primary"
      : "list-disc"
  );

// Block pass. Returns sibling nodes; the caller owns the wrapper (and its
// text size/colour), so one renderer serves article bodies, FAQ answers and
// the editor preview.
export function renderRichText(text: string, keyBase = "rt"): ReactNode[] {
  return parseRichText(text).map((b, i) => {
    const k = `${keyBase}-${i}`;
    if (b.kind === "list") {
      const Tag = b.ordered ? "ol" : "ul";
      return (
        <Tag key={k} className={listClass(b.ordered)}>
          {b.items.map((it, j) => (
            <li key={j}>{renderInlineRich(it, `${k}-${j}`)}</li>
          ))}
        </Tag>
      );
    }
    return (
      <p key={k}>
        {b.lines.map((line, j) => (
          <span key={j}>
            {j > 0 ? <br /> : null}
            {renderInlineRich(line, `${k}-${j}`)}
          </span>
        ))}
      </p>
    );
  });
}
