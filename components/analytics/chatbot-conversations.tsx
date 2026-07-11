"use client";

import { type ReactNode, useState } from "react";
import { ChevronDown, MessagesSquare } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import type {
  ConversationsView,
  ConversationStatus,
  EnrichedConversation,
} from "@/lib/conversation-insights";

// Status turns "read logs" into "understand needs": amber = a real need the
// assistant couldn't meet (a gap to prepare for or build resources for; the chat
// is anonymous so no one can be contacted), red = the assistant mishandled it
// (fix the bot), green = answered, grey = the person never asked anything (a
// greeting, test, or drop-off). Semantic colours, deliberately not the brand teal.
const STATUS_META: Record<
  ConversationStatus,
  { label: string; chip: string; dot: string }
> = {
  needs_follow_up: {
    label: "Unmet need",
    chip: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  bot_gap: {
    label: "Assistant fell short",
    chip: "bg-destructive/10 text-destructive",
    dot: "bg-destructive",
  },
  resolved: {
    label: "Answered",
    chip: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  incomplete: {
    label: "No question asked",
    chip: "bg-secondary text-muted-foreground",
    dot: "bg-muted-foreground/40",
  },
};

type Filter = "all" | ConversationStatus;

function formatWhen(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

// ── the whole page body: needs overview + filters + conversation cards ──
export function ChatbotConversations({
  view,
  emptyLabel,
}: {
  view: ConversationsView;
  emptyLabel?: ReactNode;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  if (view.total === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-100 text-primary">
            <MessagesSquare aria-hidden className="size-6" />
          </span>
          <p className="text-ds-s font-bold text-foreground">No conversations yet</p>
          <p className="max-w-sm text-ds-xs leading-relaxed text-muted-foreground">
            {emptyLabel ??
              "Once people start chatting with the assistant, their needs will appear here."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const conversations = view.conversations.filter(
    (c) => filter === "all" || c.insight.status === filter
  );
  const maxTheme = view.themes[0]?.count ?? 1;

  return (
    <div className="space-y-6">
      {/* ── Top needs: the thesis. What people needed, at a glance. ── */}
      <div className="rounded-lg border-2 border-border bg-card px-5 py-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground">
            Top needs
          </p>
          <p className="text-ds-xxs font-medium text-muted-foreground">
            {view.total} conversation{view.total === 1 ? "" : "s"}
          </p>
        </div>

        <div className="mt-4 space-y-2.5">
          {view.themes.map((t) => (
            <div
              key={t.name}
              className="grid grid-cols-[minmax(0,9.5rem)_1fr_1.75rem] items-center gap-3.5"
            >
              <span className="truncate text-ds-xs font-bold text-foreground">
                {t.name}
              </span>
              <span className="h-3 overflow-hidden rounded-full bg-secondary">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(8, (t.count / maxTheme) * 100)}%` }}
                />
              </span>
              <span className="text-right text-ds-xs font-bold tabular-nums text-primary">
                {t.count}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-2 border-border pt-4">
          <p className="text-ds-xs font-medium text-foreground">
            {view.followUpCount > 0 ? (
              <>
                <span className="font-bold text-amber-700">
                  {view.followUpCount} of {view.total}
                </span>{" "}
                raised a need the assistant couldn&apos;t meet
              </>
            ) : (
              "Every need was met or self-served"
            )}
            {view.incompleteCount > 0 ? (
              <span className="text-muted-foreground">
                {" · "}
                {view.incompleteCount} had no question (greetings or drop-offs)
              </span>
            ) : null}
          </p>
          {view.languages.length > 0 ? (
            <span className="flex items-center gap-1.5">
              <span className="text-ds-xxs font-medium text-muted-foreground">
                Languages
              </span>
              {view.languages.map((l) => (
                <span
                  key={l.name}
                  className="rounded-full border-2 border-border bg-secondary/40 px-2 py-0.5 text-ds-xxs font-bold text-muted-foreground"
                >
                  {l.name} {l.count}
                </span>
              ))}
            </span>
          ) : null}
        </div>
      </div>

      {/* ── Filters: make the follow-ups + bot gaps a worklist. ── */}
      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} count={view.total}>
          All
        </FilterChip>
        <FilterChip
          active={filter === "needs_follow_up"}
          onClick={() => setFilter("needs_follow_up")}
          count={view.followUpCount}
          dot="bg-amber-500"
        >
          Unmet needs
        </FilterChip>
        {view.botGapCount > 0 ? (
          <FilterChip
            active={filter === "bot_gap"}
            onClick={() => setFilter("bot_gap")}
            count={view.botGapCount}
            dot="bg-destructive"
          >
            Assistant fell short
          </FilterChip>
        ) : null}
      </div>

      {/* ── Conversations, each titled by its need. ── */}
      <div className="space-y-3">
        {conversations.map((c) => (
          <ConversationCard key={`${c.conversationId}-${c.at}`} c={c} />
        ))}
        {conversations.length === 0 ? (
          <p className="rounded-lg border-2 border-dashed border-border p-8 text-center text-ds-xs font-medium text-muted-foreground">
            Nothing in this view.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  count,
  dot,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  dot?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-ds-xs font-bold transition-colors",
        active
          ? "border-brand-dark bg-brand-dark text-brand-000"
          : "border-border bg-card text-muted-foreground hover:border-foreground/20"
      )}
    >
      {dot ? <span className={cn("size-2 rounded-full", dot)} /> : null}
      {children}
      <span className="tabular-nums opacity-80">{count}</span>
    </button>
  );
}

// ── rich text for transcript messages ──────────────────────────────────────
// Carebot's replies are plain text carrying a few patterns: markdown links
// [label](url), bare URLs, **bold**, and numbered menus. Render them so a long
// URL becomes a short labelled link and a menu reads as a tidy list.

function friendlyLinkLabel(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host.includes("goo.gl") || u.pathname.includes("maps")) return "Open in Maps";
    if (host.includes("padlet")) return "External contacts list";
    if (host.includes("whatsapp")) return "WhatsApp channel";
    if (host.includes("mailerpage")) return "Open AdminHub";
    return host;
  } catch {
    return "Open link";
  }
}

// One pass matches, in order: [label](url) | bare url | **bold**.
const INLINE_RE = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|(https?:\/\/[^\s)]+)|\*\*([^*]+)\*\*/g;

function renderInline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const linkCls = "font-medium text-primary underline underline-offset-2 hover:opacity-80";
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;
  while ((m = INLINE_RE.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyBase}-${i++}`;
    if (m[1]) {
      out.push(
        <a key={key} href={m[2]} target="_blank" rel="noreferrer noopener" className={linkCls}>
          {m[1]}
        </a>
      );
    } else if (m[3]) {
      out.push(
        <a key={key} href={m[3]} target="_blank" rel="noreferrer noopener" className={linkCls}>
          {friendlyLinkLabel(m[3])}
        </a>
      );
    } else if (m[4]) {
      out.push(
        <strong key={key} className="font-bold text-foreground">
          {m[4]}
        </strong>
      );
    }
    last = INLINE_RE.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// Splits on newlines; a line like "3. Education" becomes a hanging-indent list row.
function RichMessage({ text }: { text: string }) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const item = line.match(/^(\d{1,2})[.)]\s+(.*)/);
        return item ? (
          <div key={i} className="flex gap-2 pl-1">
            <span className="shrink-0 tabular-nums text-muted-foreground">{item[1]}.</span>
            <span>{renderInline(item[2], `l${i}`)}</span>
          </div>
        ) : (
          <p key={i}>{renderInline(line, `l${i}`)}</p>
        );
      })}
    </div>
  );
}

function ConversationCard({ c }: { c: EnrichedConversation }) {
  const { insight, turns, questionCount, at } = c;
  const s = STATUS_META[insight.status];

  return (
    <Card className="px-5 py-4">
      <details className="group/conv">
        <summary className="flex cursor-pointer list-none flex-col gap-2 rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35 [&::-webkit-details-marker]:hidden">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-heading text-ds-s font-bold text-foreground">
              {insight.need}
            </h2>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-ds-xxs font-bold",
                s.chip
              )}
            >
              <span className={cn("size-1.5 rounded-full", s.dot)} />
              {s.label}
            </span>
          </div>

          <p className="text-ds-xs leading-relaxed text-foreground/80">
            {insight.summary}
          </p>

          <div className="mt-0.5 flex items-center gap-2 text-ds-xxs text-muted-foreground">
            {insight.language ? <Tag>{insight.language}</Tag> : null}
            <span>{formatWhen(at)}</span>
            <span className="text-border">·</span>
            <span>
              {questionCount} question{questionCount === 1 ? "" : "s"}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 font-bold text-primary">
              <span className="group-open/conv:hidden">Show transcript</span>
              <span className="hidden group-open/conv:inline">Hide transcript</span>
              <ChevronDown
                aria-hidden
                className="size-3.5 transition-transform duration-200 group-open/conv:rotate-180"
              />
            </span>
          </div>
        </summary>

        <div className="mt-4 space-y-3 border-t-2 border-border pt-4 group-open/conv:animate-in group-open/conv:fade-in group-open/conv:slide-in-from-top-1 group-open/conv:duration-200">
          {turns.length > 0 ? (
            turns.map((t, i) =>
              t.isGreeting ? (
                <details
                  key={i}
                  className="group/greet rounded-md border-2 border-border bg-secondary/30 px-3 py-2"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground [&::-webkit-details-marker]:hidden">
                    <ChevronDown className="size-3.5 shrink-0 transition-transform group-open/greet:rotate-180" />
                    Chatbot greeting &amp; language menu
                  </summary>
                  <div className="mt-2 break-words text-ds-xxs leading-relaxed text-muted-foreground">
                    <RichMessage text={t.text} />
                  </div>
                </details>
              ) : (
                <div
                  key={i}
                  className={cn(
                    "border-l-2 pl-3",
                    t.role === "user" ? "border-primary" : "border-border"
                  )}
                >
                  <p
                    className={cn(
                      "text-ds-xxs font-bold uppercase tracking-wide",
                      t.role === "user" ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {t.role === "user" ? "Person" : "Assistant"}
                  </p>
                  <div
                    className={cn(
                      "mt-0.5 break-words text-ds-xs leading-relaxed",
                      t.role === "user" ? "font-medium text-foreground" : "text-muted-foreground"
                    )}
                  >
                    <RichMessage text={t.text} />
                  </div>
                </div>
              )
            )
          ) : (
            <p className="scroll-fade max-h-96 overflow-auto whitespace-pre-wrap break-words text-ds-xs leading-relaxed text-muted-foreground">
              (transcript unavailable)
            </p>
          )}
        </div>
      </details>
    </Card>
  );
}
