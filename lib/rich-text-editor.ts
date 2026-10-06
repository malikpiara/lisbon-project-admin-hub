// Converters between the stored article text format (lib/rich-text.ts) and a
// visual editor (TipTap/ProseMirror). The visual editor is only an input
// surface: what's saved is still the same plain string, so the public renderer,
// the review diff and existing content don't change.
//
//   toEditorHTML(stored)  → HTML the editor loads
//   fromEditorJSON(doc)   → the string we'd save

import { parseInline, parseRichText, type InlineSegment } from "./rich-text";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/)/i;

// [label](href) → <a>; everything else escaped. (Bare URLs stay text: the
// public renderer auto-links them anyway.)
function linksToHTML(text: string): string {
  let out = "";
  let last = 0;
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out += esc(text.slice(last, m.index));
    out += SAFE_HREF.test(m[2])
      ? `<a href="${esc(m[2])}">${esc(m[1])}</a>`
      : esc(m[0]);
    last = m.index + m[0].length;
  }
  return out + esc(text.slice(last));
}

function segmentsToHTML(segments: InlineSegment[]): string {
  return segments
    .map((s) =>
      s.kind === "bold"
        ? `<strong>${segmentsToHTML(s.children)}</strong>`
        : s.kind === "italic"
          ? `<em>${linksToHTML(s.text)}</em>`
          : linksToHTML(s.text)
    )
    .join("");
}

const lineHTML = (lines: string[]) =>
  lines.map((l) => segmentsToHTML(parseInline(l))).join("<br>");

/** Stored string → HTML for the visual editor to load. */
export function toEditorHTML(text: string): string {
  return parseRichText(text)
    .map((b) => {
      if (b.kind === "p") return `<p>${lineHTML(b.lines)}</p>`;
      const tag = b.ordered ? "ol" : "ul";
      const start = b.ordered && b.start !== 1 ? ` start="${b.start}"` : "";
      return `<${tag}${start}>${b.items.map((it) => `<li><p>${lineHTML(it)}</p></li>`).join("")}</${tag}>`;
    })
    .join("");
}

// ---- Editor JSON → stored string -----------------------------------------

type PMMark = { type: string; attrs?: Record<string, any> };
type PMNode = {
  type: string;
  text?: string;
  marks?: PMMark[];
  attrs?: Record<string, any>;
  content?: PMNode[];
};

const marksKey = (n: PMNode) =>
  JSON.stringify(
    (n.marks ?? [])
      .map((m) => (m.type === "link" ? `link:${m.attrs?.href ?? ""}` : m.type))
      .sort()
  );

function inlineToText(nodes: PMNode[] = []): string {
  // Merge neighbouring text runs with identical marks first, so "a" + "b" both
  // bold serialise as **ab**, not **a****b**.
  const runs: PMNode[] = [];
  for (const n of nodes) {
    const prev = runs[runs.length - 1];
    if (n.type === "text" && prev?.type === "text" && marksKey(prev) === marksKey(n)) {
      runs[runs.length - 1] = { ...prev, text: (prev.text ?? "") + (n.text ?? "") };
    } else runs.push(n);
  }
  return runs
    .map((n) => {
      if (n.type === "hardBreak") return "\n";
      if (n.type !== "text" || !n.text) return "";
      const marks = n.marks ?? [];
      const link = marks.find((m) => m.type === "link");
      // Link innermost, then italic, then bold: **[label](url)** parses back;
      // [**label**](url) would not.
      let t = n.text;
      if (link?.attrs?.href && t !== link.attrs.href) t = `[${t}](${link.attrs.href})`;
      if (marks.some((m) => m.type === "italic")) t = `*${t}*`;
      if (marks.some((m) => m.type === "bold")) t = `**${t}**`;
      return t;
    })
    .join("");
}

// A list item's paragraphs become its lines (continuations are indented so
// the parser keeps them inside the item).
function itemToText(item: PMNode, marker: string): string {
  const parts = (item.content ?? [])
    .filter((c) => c.type === "paragraph")
    .flatMap((c) => inlineToText(c.content).split("\n"));
  return [`${marker} ${parts[0] ?? ""}`, ...parts.slice(1).map((p) => `   ${p}`)].join("\n");
}

/** Visual editor document (editor.getJSON()) → stored string. */
export function fromEditorJSON(doc: PMNode): string {
  return (doc.content ?? [])
    .map((n) => {
      if (n.type === "paragraph") return inlineToText(n.content);
      if (n.type === "bulletList")
        return (n.content ?? []).map((it) => itemToText(it, "-")).join("\n");
      if (n.type === "orderedList") {
        const start = Number(n.attrs?.start ?? 1);
        return (n.content ?? []).map((it, i) => itemToText(it, `${start + i}.`)).join("\n");
      }
      return "";
    })
    .filter((s) => s.trim())
    .join("\n\n");
}
