import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { renderInline } from "@/components/services/inline-links";

export type ReferenceTableRow = { label: string; items: string[] };
export type ReferenceTableData = { title: string; rows: ReferenceTableRow[] };

// The "Two-column reference table": an optional title spanning both columns,
// then rows of a bold label (left) paired with a bulleted content column
// (right). Mirrors the styleguide's Documents-Required layout.
export function ReferenceTable({ title, rows }: ReferenceTableData) {
  if (!rows?.length) return null;
  return (
    <Table className="min-w-[680px]">
      {title ? (
        <TableHeader>
          <TableRow>
            <TableHead
              colSpan={2}
              className="h-auto whitespace-normal bg-secondary/50 py-3 text-center text-ds-s font-bold uppercase tracking-wide text-primary"
            >
              {title}
            </TableHead>
          </TableRow>
        </TableHeader>
      ) : null}
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            <TableCell className="w-1/4 border-r-2 border-border px-3 py-4 align-top font-bold whitespace-normal text-foreground">
              {row.label}
            </TableCell>
            <TableCell className="px-3 py-4 align-top whitespace-normal text-brand-deep">
              {row.items.length ? (
                <ul className="list-disc space-y-1.5 pl-5">
                  {row.items.map((item, j) => (
                    <li key={j}>{renderInline(item, `${i}-${j}`)}</li>
                  ))}
                </ul>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
