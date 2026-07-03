import type { ReactNode } from "react";
import { ChevronDown, MessagesSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export type ChatbotConversation = {
  conversationId: string;
  transcript: string;
  at: string; // ISO timestamp
};

type Turn = { speaker: string; role: "user" | "bot"; text: string };

// Speaker labels we trust enough to split a transcript into turns. We split ONLY
// on these — never on an arbitrary "Word:" — so a bot answer that happens to
// contain "Housing:" or "Tip:" stays one turn instead of fragmenting. If a
// transcript uses labels outside this set, parseTranscript returns [] and we
// fall back to readable prose (see below).
const USER_LABELS = new Set([
  "user",
  "visitor",
  "you",
  "human",
  "guest",
  "client",
  "me",
]);
const BOT_LABELS = new Set([
  "bot",
  "assistant",
  "ai",
  "agent",
  "chatbot",
  "carebot",
  "system",
  "support",
  "helper",
]);

function parseTranscript(raw: string): Turn[] {
  if (!raw || !raw.trim()) return [];
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const turns: Turn[] = [];
  for (const line of lines) {
    // Drop a leading [timestamp] if present, then look for "Speaker: text".
    const stripped = line.replace(/^\s*\[[^\]]*\]\s*/, "");
    const idx = stripped.indexOf(":");
    const label = idx > 0 && idx <= 24 ? stripped.slice(0, idx).trim() : "";
    const key = label.toLowerCase();
    if (USER_LABELS.has(key) || BOT_LABELS.has(key)) {
      turns.push({
        speaker: label,
        role: USER_LABELS.has(key) ? "user" : "bot",
        text: stripped.slice(idx + 1).trim(),
      });
    } else if (line.trim() && turns.length > 0) {
      // Continuation of the turn in progress (wrapped line, list item, etc.).
      turns[turns.length - 1].text += "\n" + line.trim();
    }
  }
  return turns
    .map((t) => ({ ...t, text: t.text.trim() }))
    .filter((t) => t.text.length > 0);
}

function formatWhen(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function firstNonEmptyLine(raw: string): string {
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (t) return t;
  }
  return "";
}

// Read-only list of PII-redacted help-chatbot transcripts. Special-category data
// on this site — kept plain and team-only, never linked to a web-session person
// (the distinct_id is the conversation id, by design).
//
// Each conversation leads with the visitor's FIRST question (the reason they
// reached out) so the team can scan the list like an inbox; the full exchange is
// one click away in a native <details>. Parsing failures degrade to plain prose,
// never a broken card.
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
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-100 text-primary">
            <MessagesSquare aria-hidden className="size-6" />
          </span>
          <p className="text-ds-s font-bold text-foreground">
            No conversations yet
          </p>
          <p className="max-w-sm text-ds-xs leading-relaxed text-muted-foreground">
            {emptyLabel ??
              "Once people start chatting with the assistant, their questions will appear here."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((c) => {
        const turns = parseTranscript(c.transcript);
        const firstUser = turns.find((t) => t.role === "user");
        const questionCount = turns.filter((t) => t.role === "user").length;
        const title =
          firstUser?.text || firstNonEmptyLine(c.transcript) || "Conversation";
        const metaParts = [formatWhen(c.at)];
        if (questionCount > 0) {
          metaParts.push(
            `${questionCount} question${questionCount === 1 ? "" : "s"}`,
          );
        }
        const meta = metaParts.filter(Boolean).join(" · ");

        return (
          <Card key={`${c.conversationId}-${c.at}`}>
            <details className="group/conv px-4 xl:px-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-ds-s font-bold text-foreground">
                    {title}
                  </p>
                  <p className="mt-1 text-ds-xxs text-muted-foreground">
                    {meta}
                  </p>
                </div>
                <ChevronDown
                  aria-hidden
                  className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open/conv:rotate-180"
                />
              </summary>

              <div className="mt-4 border-t border-border pt-4 group-open/conv:animate-in group-open/conv:fade-in group-open/conv:slide-in-from-top-1 group-open/conv:duration-200">
                {turns.length > 0 ? (
                  <div className="space-y-3">
                    {turns.map((t, i) => (
                      <div
                        key={i}
                        className={cn(
                          "border-l-2 pl-3",
                          t.role === "user"
                            ? "border-primary"
                            : "border-border",
                        )}
                      >
                        <p
                          className={cn(
                            "text-ds-xxs font-semibold uppercase tracking-wide",
                            t.role === "user"
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        >
                          {t.speaker}
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 whitespace-pre-wrap break-words text-ds-xs leading-relaxed",
                            t.role === "user"
                              ? "font-medium text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {t.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="max-h-96 overflow-auto whitespace-pre-wrap break-words text-ds-xs leading-relaxed text-muted-foreground">
                    {c.transcript || "(empty transcript)"}
                  </p>
                )}

                {c.conversationId ? (
                  <p className="mt-4 text-ds-xxs text-muted-foreground/70">
                    Session {c.conversationId}
                  </p>
                ) : null}
              </div>
            </details>
          </Card>
        );
      })}
    </div>
  );
}
