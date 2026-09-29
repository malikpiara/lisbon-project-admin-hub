import type { ReactNode } from "react";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SampleDataBadge } from "@/components/analytics/sample-data-badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ContactsSearch = { query: string; searches: number };

// Made-up example queries, shown only when a caller opts in with `sample` (e.g.
// /admin/insights before PostHog is connected) — and then always labelled as
// sample data. Live counts come in via `data`; missing data is never silently
// replaced with these.
const SAMPLE_DATA: ContactsSearch[] = [
  { query: "housing", searches: 142 },
  { query: "legal aid", searches: 118 },
  { query: "asylum", searches: 97 },
  { query: "portuguese classes", searches: 86 },
  { query: "health center", searches: 73 },
  { query: "childcare", searches: 64 },
  { query: "job", searches: 51 },
  { query: "residence permit", searches: 44 },
];

export function ContactsSearchesTable({
  data = [],
  sample = false,
  title = "What are people searching for in All Contacts?",
  description = "Most-searched queries · last 30 days",
  caption = "Wire to the contacts_searched PostHog insight for live counts.",
  emptyLabel = "No searches yet.",
  headerAction,
}: {
  data?: ContactsSearch[];
  /** Show the built-in example rows instead of `data`, clearly labelled. */
  sample?: boolean;
  title?: string;
  description?: string;
  caption?: ReactNode;
  emptyLabel?: ReactNode;
  headerAction?: ReactNode;
}) {
  // Ordered by most searched (immutable sort — Vercel best practice: js-tosorted-immutable).
  const ranked = (sample ? SAMPLE_DATA : data).toSorted((a, b) => b.searches - a.searches);
  const action = sample ? <SampleDataBadge /> : headerAction;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-ds-xxs font-semibold uppercase tracking-wide text-muted-foreground">
                Search
              </TableHead>
              <TableHead className="text-right text-ds-xxs font-semibold uppercase tracking-wide text-muted-foreground">
                Searches
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={sample ? "opacity-60" : undefined}>
            {ranked.map((row) => (
              <TableRow key={row.query}>
                <TableCell className="font-bold text-foreground">
                  {row.query}
                </TableCell>
                <TableCell className="text-right tabular-nums text-foreground">
                  {row.searches.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {ranked.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="py-8 text-center text-muted-foreground"
                >
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
          <TableCaption>
            {sample
              ? "Example numbers to preview the layout, not real searches. Connect PostHog to see live counts."
              : caption}
          </TableCaption>
        </Table>
      </CardContent>
    </Card>
  );
}
