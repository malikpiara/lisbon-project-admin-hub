import type { ReactNode } from "react";

import { renderInline } from "@/components/services/inline-links";
import {
  parseInline,
  parseRichText,
  type InlineSegment,
} from "@/lib/rich-text";
import { cn } from "@/lib/utils";

// Renders the article text format (lib/rich-text.ts) as React elements — never
// HTML strings — so editor-typed text can't inject markup, and links go through
// inline-links.tsx's allowlist (http(s), mailto, tel, site paths). One renderer
// for the public page AND every editor preview, so what editors see is what
// visitors get.

function renderSegments(segments: InlineSegment[], keyBase: string): ReactNode[] {
  return segments.flatMap((s, i): ReactNode[] => {
    const k = `${keyBase}-${i}`;
    if (s.kind === "bold")
      return [
        <strong key={k} className="font-bold">
          {renderSegments(s.children, k)}
        </strong>,
      ];
    if (s.kind === "italic") return [<em key={k}>{renderInline(s.text, k)}</em>];
    return renderInline(s.text, k);
  });
}

/** One line of text: bold, italic and links. */
export function renderInlineRich(text: string, keyBase = "r"): ReactNode[] {
  return renderSegments(parseInline(text), keyBase);
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

function lines(parts: string[], keyBase: string): ReactNode[] {
  return parts.map((line, j) => (
    <span key={j}>
      {j > 0 ? <br /> : null}
      {renderInlineRich(line, `${keyBase}-${j}`)}
    </span>
  ));
}

/**
 * Block pass. Returns sibling nodes; the caller owns the wrapper (spacing,
 * text size and colour), so the same output fits article bodies, FAQ answers
 * and previews. Keep the wrapper a block, not a flex container — flex splits
 * inline runs and scrambles word order around <strong>/<em>.
 */
export function renderRichText(text: string, keyBase = "rt"): ReactNode[] {
  return parseRichText(text).map((b, i) => {
    const k = `${keyBase}-${i}`;
    if (b.kind === "list") {
      const Tag = b.ordered ? "ol" : "ul";
      return (
        <Tag
          key={k}
          className={listClass(b.ordered)}
          // Keep the author's number: "7. Cross-Body Swinging" alone in its
          // block must read 7, not restart at 1.
          {...(b.ordered && b.start !== 1 ? { start: b.start } : {})}
        >
          {b.items.map((it, j) => (
            <li key={j}>{lines(it, `${k}-${j}`)}</li>
          ))}
        </Tag>
      );
    }
    return <p key={k}>{lines(b.lines, k)}</p>;
  });
}
