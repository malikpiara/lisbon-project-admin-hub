import type { CSSProperties } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { renderInlineRich } from "@/components/services/rich-text";
import { stripListMarker } from "@/lib/rich-text";
import { cellLines, hasHeaders } from "@/lib/table-block";
import { cn } from "@/lib/utils";

// The normalised table (lib/table-block.js): one heading per column ("" for
// none) and one string per cell, lines separated by "\n".
export type ReferenceTableData = {
  title: string;
  headers: string[];
  rows: string[][];
};

// How far a table may grow past the 760px reading column, by column count. A
// 2-column table stays in the column (its content cell already reads at ~65
// characters a line); 3 and 4 columns break out so each cell keeps ~34
// characters a line at a 1440px screen. Capped by the section card's inner
// width via .table-breakout (app/globals.css).
const BREAKOUT: Record<number, string> = { 3: "1040px", 4: "1328px" };

const labelCell =
  "w-1/3 border-r-2 border-border px-3 py-4 align-top font-bold whitespace-normal text-foreground md:w-1/4";
const bodyCell = "px-3 py-4 align-top whitespace-normal text-brand-deep";

function Cell({ lines, keyBase }: { lines: string[]; keyBase: string }) {
  if (!lines.length) return null;
  if (lines.length === 1) return <>{renderInlineRich(stripListMarker(lines[0]), keyBase)}</>;
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {lines.map((line, k) => (
        <li key={k}>{renderInlineRich(stripListMarker(line), `${keyBase}-${k}`)}</li>
      ))}
    </ul>
  );
}

// Reference table: an optional title across the top, an optional heading row,
// then rows whose first cell is a bold label and whose other cells hold text
// or bullets (one bullet per line). From 3 columns up it breaks out of the
// reading column on wide screens and stacks into one card per row on phones.
export function ReferenceTable({ title, headers, rows }: ReferenceTableData) {
  if (!rows?.length) return null;
  const n = headers.length;
  const wide = n >= 3;
  const showHeaders = hasHeaders(headers);
  const style = BREAKOUT[n]
    ? ({ "--table-breakout": BREAKOUT[n] } as CSSProperties)
    : undefined;

  return (
    <div className={cn(wide && "table-breakout table-stack")} style={style}>
      <Table className={cn("caption-top", wide && "table-fixed")}>
        {title ? (
          <caption className="bg-secondary/50 px-3 py-3 text-center text-ds-s font-bold uppercase tracking-wide text-primary">
            {title}
          </caption>
        ) : null}
        {showHeaders ? (
          <TableHeader>
            <TableRow>
              {headers.map((h, i) => (
                <TableHead
                  key={i}
                  className={cn(
                    "h-auto px-3 py-2 text-left text-ds-xxs font-bold uppercase tracking-wide whitespace-normal text-primary",
                    i === 0 && "w-1/3 md:w-1/4"
                  )}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        ) : null}
        <TableBody>
          {rows.map((cells, i) => (
            <TableRow key={i}>
              {cells.map((cell, j) => {
                const lines = cellLines(cell);
                if (j === 0) {
                  return (
                    <TableCell key={j} className={labelCell}>
                      {lines.map((line, k) => (
                        <span key={k}>
                          {k > 0 ? <br /> : null}
                          {renderInlineRich(line, `${i}-${j}-${k}`)}
                        </span>
                      ))}
                    </TableCell>
                  );
                }
                const label = showHeaders && headers[j].trim() ? headers[j] : undefined;
                return (
                  <TableCell key={j} data-label={label} className={bodyCell}>
                    <Cell lines={lines} keyBase={`${i}-${j}`} />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
