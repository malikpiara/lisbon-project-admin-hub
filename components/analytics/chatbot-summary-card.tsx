import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// At-a-glance chatbot numbers for /admin/insights, linking through to the full
// transcripts at /admin/conversations. `conversations` is transcript captures
// (via Zapier); `opens` is client-side engagement. Null → "—" (not configured).
export function ChatbotSummaryCard({
  conversations,
  opens,
}: {
  conversations: number | null;
  opens: number | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What are people asking the assistant?</CardTitle>
        <CardDescription>Help chatbot · last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-baseline gap-8">
          <div>
            <p className="text-ds-xxl font-bold tabular-nums text-foreground">
              {conversations ?? "—"}
            </p>
            <p className="text-ds-xxs text-muted-foreground">
              conversations logged
            </p>
          </div>
          <div>
            <p className="text-ds-l font-bold tabular-nums text-foreground">
              {opens ?? "—"}
            </p>
            <p className="text-ds-xxs text-muted-foreground">chatbot opened</p>
          </div>
        </div>
        <Link
          href="/admin/conversations"
          className="inline-flex items-center gap-1.5 text-ds-xs font-bold text-brand-link hover:underline"
        >
          Read the conversations →
        </Link>
      </CardContent>
    </Card>
  );
}
