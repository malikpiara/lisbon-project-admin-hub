import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type ChatbotConversation = {
  conversationId: string;
  transcript: string;
  at: string; // ISO timestamp
};

function formatWhen(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

// Read-only list of PII-redacted help-chatbot transcripts. Special-category data
// on this site — kept plain and team-only, never linked to a web-session person
// (the distinct_id is the conversation id, by design).
export function ChatbotConversations({
  data,
  emptyLabel,
}: {
  data: ChatbotConversation[];
  emptyLabel?: ReactNode;
}) {
  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-ds-s text-muted-foreground">
          {emptyLabel ?? "No conversations captured yet."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((c) => (
        <Card key={`${c.conversationId}-${c.at}`}>
          <CardHeader>
            <CardTitle className="text-ds-s">Conversation</CardTitle>
            <CardDescription>
              {formatWhen(c.at)}
              {c.conversationId ? ` · ${c.conversationId}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words font-sans text-ds-xs text-foreground">
              {c.transcript || "(empty transcript)"}
            </pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
