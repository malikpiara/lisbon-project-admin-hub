import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

// Sample data (real-domain queries). Swap for live counts from the
// `contacts_searched` PostHog insight — pass them via the `data` prop.
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
  data = SAMPLE_DATA,
  title = "What are people searching for in All Contacts?",
  description = "Most-searched queries · last 30 days",
}: {
  data?: ContactsSearch[];
  title?: string;
  description?: string;
}) {
  // Ordered by most searched (immutable sort — Vercel best practice: js-tosorted-immutable).
  const ranked = data.toSorted((a, b) => b.searches - a.searches);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Search</TableHead>
              <TableHead className="text-right">Searches</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
                  No searches yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
          <TableCaption>
            Wire to the <code>contacts_searched</code> PostHog insight for live counts.
          </TableCaption>
        </Table>
      </CardContent>
    </Card>
  );
}
