import type { ReactNode } from "react";
import { ChevronDown, MessagesSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";

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

// Carebot opens every conversation with the same greeting + numbered language
// menu, so a visitor's FIRST message is almost always which number they picked.
// Map it back to a language name so the team reads "Português", not "3" — and so
// we can tell a real question apart from a menu pick.
const MENU_LANGUAGES: Record<string, string> = {
  "1": "English",
  "2": "Français",
  "3": "Português",
  "4": "Español",
  "5": "العربية",
};

// A bare menu pick ("3", "3.", "3)") — a language choice, not a real question.
function isMenuPick(text: string): boolean {
  return /^[1-5][.)]?$/.test(text.trim());
}

// The opener is long, identical every time, and dominates the card — treat the
// first bot turn as the greeting when it carries the language menu (or is very
// long) so it can be collapsed and the real exchange leads.
function isGreeting(turn: Turn): boolean {
  return turn.role === "bot" && (turn.text.length > 220 || /language/i.test(turn.text));
}

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

// Read-only list of help-chatbot transcripts. Special-category data on this site
// — kept plain and team-only, never linked to a web-session person (the
// distinct_id is the conversation id, by design). Emails/phones are masked
// upstream (see lib/redact-pii).
//
// Information hierarchy is built around the one question the team scans for:
// "what did this person actually want?" So each card LEADS with the first real
// question (the boilerplate greeting and the language-menu pick are demoted to a
// tag + a collapsed block), and says so plainly when someone only picked a
// language and left. Parsing failures degrade to plain prose, never a broken card.
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
        const userTurns = turns.filter((t) => t.role === "user");
        const pick = userTurns.find((t) => isMenuPick(t.text));
        const language = pick ? MENU_LANGUAGES[pick.text.trim()[0]] : null;
        const questions = userTurns.filter((t) => !isMenuPick(t.text));
        const questionCount = questions.length;

        // Lead with the real question. If they only chose a language and left,
        // say that plainly (muted) rather than showing a bare "3".
        const hasQuestion = Boolean(questions[0]?.text);
        const title = hasQuestion
          ? questions[0].text
          : language
            ? "No question asked"
            : firstNonEmptyLine(c.transcript) || "Conversation";

        const meta = [
          formatWhen(c.at),
          questionCount > 0
            ? `${questionCount} question${questionCount === 1 ? "" : "s"}`
            : "no question",
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <Card key={`${c.conversationId}-${c.at}`}>
            <details className="group/conv px-4 xl:px-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "line-clamp-2 text-ds-s font-bold",
                      hasQuestion
                        ? "text-foreground"
                        : "italic text-muted-foreground",
                    )}
                  >
                    {title}
                  </p>
                  <p className="mt-1 text-ds-xxs text-muted-foreground">{meta}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  {language ? <Tag>{language}</Tag> : null}
                  <ChevronDown
                    aria-hidden
                    className="mt-0.5 size-4 text-muted-foreground transition-transform duration-200 group-open/conv:rotate-180"
                  />
                </div>
              </summary>

              <div className="mt-4 border-t border-border pt-4 group-open/conv:animate-in group-open/conv:fade-in group-open/conv:slide-in-from-top-1 group-open/conv:duration-200">
                {turns.length > 0 ? (
                  <div className="space-y-3">
                    {turns.map((t, i) =>
                      i === 0 && isGreeting(t) ? (
                        <details
                          key={i}
                          className="group/greet rounded-md border border-border/70 bg-muted/40 px-3 py-2"
                        >
                          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-ds-xxs font-semibold uppercase tracking-wide text-muted-foreground [&::-webkit-details-marker]:hidden">
                            <ChevronDown className="size-3.5 shrink-0 transition-transform group-open/greet:rotate-180" />
                            Chatbot greeting &amp; language menu
                          </summary>
                          <p className="mt-2 whitespace-pre-wrap break-words text-ds-xxs leading-relaxed text-muted-foreground">
                            {t.text}
                          </p>
                        </details>
                      ) : (
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
                      ),
                    )}
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
