// The article text format: a forgiving subset of Markdown for the plain text
// editors already type. Stored as plain strings; this module only PARSES (pure,
// no React) so the renderer, the visual editor's converter and tests share it.
//
//   blank line            → new paragraph
//   single Enter          → line break (standard Markdown would collapse it to
//                           a space — the bug the team reported)
//   "- " / "• " / "* "    → bulleted list
//   "3. " / "3) "         → numbered list that KEEPS the author's number (editors
//                           put each step in its own block: "1. …", "2. …" —
//                           a plain <ol> would restart every one at 1)
//   indented line under a list item → continues that item (line break)
//   **bold**, *italic*    → inline emphasis (links are handled at render time
//                           by components/services/inline-links.tsx)
//
// Unmatched markers stay literal text: never guess, never rewrite stored text.

export type RichBlock =
  | { kind: "p"; lines: string[] }
  | { kind: "list"; ordered: boolean; start: number; items: string[][] };

export type InlineSegment =
  | { kind: "text"; text: string }
  | { kind: "bold"; children: InlineSegment[] }
  | { kind: "italic"; text: string };

// Regexes are created per call: a shared /g regex keeps lastIndex between
// calls (and between nested calls), which silently skips matches.
const bulletRe = () => /^(\s*)[-•*][ \t]+(.*)$/;
const numberRe = () => /^(\s*)(\d{1,3})[.)][ \t]+(.*)$/;

/** Parse a stored string into paragraphs and lists. */
export function parseRichText(text: string | null | undefined): RichBlock[] {
  const blocks: RichBlock[] = [];
  let cur: RichBlock | null = null;

  for (const raw of (text ?? "").replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim()) {
      cur = null;
      continue;
    }
    const bullet = line.match(bulletRe());
    const number = bullet ? null : line.match(numberRe());
    if (bullet || number) {
      const ordered = !!number;
      const item = (bullet ? bullet[2] : number![3]).replace(/\s+/g, " ").trim();
      if (cur && cur.kind === "list" && cur.ordered === ordered) {
        cur.items.push([item]);
      } else {
        cur = {
          kind: "list",
          ordered,
          start: number ? Number(number[2]) : 1,
          items: [[item]],
        };
        blocks.push(cur);
      }
      continue;
    }
    // An indented line right under a list item continues that item.
    if (cur && cur.kind === "list" && /^\s{2,}/.test(raw)) {
      cur.items[cur.items.length - 1].push(line.trim());
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

// **bold** needs non-space just inside both markers, so "2 ** 3" stays text.
const boldRe = () => /\*\*(?=\S)([^\n]*?\S)\*\*/g;
// *italic*: not touching another * or a word character on the outside, and
// non-space just inside — so "* item", "5 * 3" and "snake*case" stay text.
const italicRe = () => /(?<![\w*])\*(?=[^\s*])([^*\n]*?[^\s*])\*(?![\w*])/g;

function italics(text: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  const re = italicRe();
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push({ kind: "text", text: text.slice(last, m.index) });
    out.push({ kind: "italic", text: m[1] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out;
}

/** Split one line into text / bold / italic segments. */
export function parseInline(text: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  const re = boldRe();
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(...italics(text.slice(last, m.index)));
    out.push({ kind: "bold", children: italics(m[1]) });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(...italics(text.slice(last)));
  return out;
}

/**
 * Plain text for places that can't show formatting (meta descriptions, search
 * snippets): markers removed, links reduced to their label, lines joined.
 */
export function toPlainText(text: string | null | undefined): string {
  return parseRichText(text)
    .flatMap((b) => (b.kind === "p" ? b.lines : b.items.map((it) => it.join(" "))))
    .join(" ")
    .replace(/\[([^\]]+)\]\(([^)]*)\)/g, "$1")
    .replace(/\*\*(?=\S)([^\n]*?\S)\*\*/g, "$1")
    .replace(/(?<![\w*])\*(?=[^\s*])([^*\n]*?[^\s*])\*(?![\w*])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * A list or table item already IS a list entry, so a marker the editor typed
 * in front of it ("- Passport", 21 live items) would show as a double bullet.
 * Drop it at render time; the stored text is left alone.
 */
export function stripListMarker(item: string): string {
  return item.replace(/^\s*(?:[-•*]|\d{1,3}[.)])\s+/, "");
}
