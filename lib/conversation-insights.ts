// Turns raw help-assistant transcripts into "needs intelligence" for the team:
// each conversation gets a synthesised need (the title), a theme, an actionable
// status, and a one-line summary — plus aggregates (top needs, follow-up count,
// languages) that answer "what do migrants actually need?" at a glance.
//
// Synthesis has two providers behind one interface:
//   • heuristic (default, no network) — parses the transcript; ships working today
//   • AI (Claude, env-gated) — richer + reliable status/theme; drop-in when a key
//     is present and CONVERSATION_SYNTHESIS=ai
// buildConversationsView() tries AI when enabled and always falls back to the
// heuristic on any error, so the page can never break on the synthesis step.
//
// AI results are cached once per conversation in the `conversation-insights`
// collection (keyed by conversationId + a transcript hash), so an already
// analysed transcript is read from Postgres and never sent to the AI again.

import { createHash } from "node:crypto";
import type { Payload } from "payload";

export type Turn = {
  speaker: string;
  role: "user" | "bot";
  text: string;
  isGreeting?: boolean;
};

export type ConversationStatus =
  | "resolved" // the assistant answered the person's question well
  | "needs_follow_up" // a real need a team member should act on
  | "bot_gap" // the person asked a real question and the answer fell short
  | "incomplete"; // no real question was asked (greeting, test, or drop-off)

export type ConversationInsight = {
  need: string; // the card title — what this person needed
  theme: string; // one of THEME_NAMES (or "Other")
  status: ConversationStatus;
  summary: string; // one line: the ask + what happened
  language: string | null;
};

export type EnrichedConversation = {
  conversationId: string;
  at: string;
  turns: Turn[];
  questionCount: number;
  insight: ConversationInsight;
};

export type ConversationsView = {
  conversations: EnrichedConversation[];
  themes: { name: string; count: number }[];
  languages: { name: string; count: number }[];
  followUpCount: number;
  botGapCount: number;
  incompleteCount: number; // conversations where no real question was asked
  total: number;
  synthesizedBy: "ai" | "heuristic";
};

type RawConversation = { conversationId: string; transcript: string; at: string };

// ── transcript parsing (ported from the old component) ───────────────────────

const USER_LABELS = new Set([
  "user",
  "visitor",
  "you",
  "human",
  "guest",
  "client",
  "me",
  "person",
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

// Carebot opens with a numbered language menu, so a visitor's first message is
// usually which number they picked. Map it back to a language name.
const MENU_LANGUAGES: Record<string, string> = {
  "1": "English",
  "2": "Français",
  "3": "Português",
  "4": "Español",
  "5": "العربية",
};
const LANGUAGE_WORDS: Record<string, string> = {
  english: "English",
  inglês: "English",
  français: "Français",
  francais: "Français",
  french: "Français",
  português: "Português",
  portugues: "Português",
  portuguese: "Português",
  español: "Español",
  espanol: "Español",
  spanish: "Español",
  arabic: "العربية",
  عربية: "العربية",
};

function isMenuPick(text: string): boolean {
  return /^[1-5][.)]?$/.test(text.trim());
}

// A first turn that is only a language selection (a number OR the language word),
// not a real need.
function languageOnly(text: string): string | null {
  const t = text.trim();
  if (isMenuPick(t)) return MENU_LANGUAGES[t[0]] ?? null;
  const word = t.toLowerCase().replace(/[.!,)]+$/, "");
  if (word.length <= 12 && LANGUAGE_WORDS[word]) return LANGUAGE_WORDS[word];
  return null;
}

// A short reply to the assistant's "what's your name?" — a name, not a need.
// Either it follows a name prompt, or it's a lone capitalised word (which, in
// these transcripts, is almost always a name).
function isNameReply(text: string, prevBot: string): boolean {
  const t = text.trim();
  const words = t.split(/\s+/);
  if (words.length > 2 || /\?/.test(t) || /\d/.test(t)) return false;
  if (/\b(name|call you|who.*speak|introduce)\b/i.test(prevBot)) return true;
  return words.length === 1 && /^[A-Z][a-z'’-]+$/.test(t);
}

// A message that's essentially just contact details ("reach me at [email]…") —
// PII is already redacted upstream, so what's left is filler, not a need. Catch
// it by its opening too, since a bot reply is sometimes merged onto the line.
function isContactShare(text: string): boolean {
  const t = text.trim();
  if (!/\[(email|phone)\]/i.test(t)) return false;
  const body = t.replace(/^(hi|hello|hey)[,!.\s]+/i, "");
  if (
    /^(here'?s|reach|contact|call|you can (reach|call|contact)|my (e-?mail|number|phone|contact)|i'?m at)\b/i.test(
      body
    )
  ) {
    return true;
  }
  const rest = t
    .replace(/\[(email|phone)\]/gi, " ")
    .replace(
      /\b(reach|call|contact|e-?mail|number|phone|me|at|my|is|are|and|or|the|thanks|thank|you|can|here|please|on|to)\b/gi,
      " "
    )
    .replace(/[^a-zA-Z]/g, "");
  return rest.length < 6;
}

function isGreeting(turn: Turn): boolean {
  return (
    turn.role === "bot" && (turn.text.length > 220 || /language/i.test(turn.text))
  );
}

export function parseTranscript(raw: string): Turn[] {
  if (!raw || !raw.trim()) return [];
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const turns: Turn[] = [];
  for (const line of lines) {
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
      turns[turns.length - 1].text += "\n" + line.trim();
    }
  }
  const cleaned = turns
    .map((t) => ({ ...t, text: t.text.trim() }))
    .filter((t) => t.text.length > 0);
  if (cleaned[0] && isGreeting(cleaned[0])) cleaned[0].isGreeting = true;
  return cleaned;
}

// How many real questions a person asked — the same skip rules as the title, so
// the "N questions" count matches what we treat as the need.
export function countRealQuestions(turns: Turn[]): number {
  let n = 0;
  let prevBot = "";
  let langSeen = false;
  for (const t of turns) {
    if (t.role === "bot") {
      prevBot = t.text;
      continue;
    }
    const lang = languageOnly(t.text);
    if (lang && !langSeen) {
      langSeen = true;
      continue;
    }
    if (isNameReply(t.text, prevBot)) continue;
    if (isContactShare(t.text)) continue;
    n++;
  }
  return n;
}

// ── theme taxonomy ───────────────────────────────────────────────────────────

const THEMES: { name: string; re: RegExp }[] = [
  {
    name: "Legal & documents",
    re: /\b(legal|lawyer|solicitor|advis|permit|residenc|visa|document|paperwork|aima|sef|asylum|citizenship|nif|niss|deport)\b/i,
  },
  {
    name: "Housing",
    re: /\b(hous|rent|room|flat|apartment|sleep|homeless|shelter|accommodation|evict|landlord)\b/i,
  },
  {
    name: "Language & education",
    re: /\b(portuguese class|language class|learn portuguese|school|enrol|course|study|educat|universit|kindergarten|nursery)\b/i,
  },
  { name: "Employment", re: /\b(job|work|employ|\bcv\b|salary|contract|unemploy|intern)\b/i },
  {
    name: "Health",
    re: /\b(health|doctor|hospital|clinic|\bsns\b|medical|medicine|mental|therapy|dentist|sick|ill|pregnan|vaccin|baby|nurse)\b/i,
  },
  {
    name: "Money & benefits",
    re: /\b(benefit|financial|social security|subsid|bank account|debt|allowance)\b/i,
  },
];
export const THEME_OTHER = "Other / general";
export const THEME_NAMES = [...THEMES.map((t) => t.name), THEME_OTHER];

function matchTheme(text: string): string {
  for (const t of THEMES) if (t.re.test(text)) return t.name;
  return THEME_OTHER;
}

// Bot language that signals the assistant sent them elsewhere / couldn't resolve.
const REFERRAL_RE =
  /\b(external|we don'?t|we do not|cannot|can'?t|unable|refer you|guide you to|reach out to|outside|another (service|organi|team)|not (something|able)|beyond)\b/i;

function titleCase(s: string): string {
  const t = s.trim().replace(/\s+/g, " ");
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

function firstNonEmptyLine(raw: string): string {
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (t) return t;
  }
  return "";
}

// ── heuristic synthesis (default, no network) ────────────────────────────────

export function synthesizeHeuristic(
  turns: Turn[],
  transcript: string
): ConversationInsight {
  const botText = turns
    .filter((t) => t.role === "bot")
    .map((t) => t.text)
    .join("\n");

  // Walk the turns so each user message can be judged against what the assistant
  // just asked, and skip the noise (language pick, name reply, contact-sharing)
  // so the need is a real question — not "English" / "Ana" / "reach me at [phone]".
  let language: string | null = null;
  const questions: string[] = [];
  let prevBot = "";
  for (const t of turns) {
    if (t.role === "bot") {
      prevBot = t.text;
      continue;
    }
    const lang = languageOnly(t.text);
    if (lang && !language) {
      language = lang;
      continue;
    }
    if (isNameReply(t.text, prevBot)) continue;
    if (isContactShare(t.text)) continue;
    questions.push(t.text);
  }

  const firstQ = questions.find((q) => q.length > 1) ?? "";
  const hasQuestion = Boolean(firstQ);

  // Need (title): the first real question, trimmed to a scannable length.
  let need: string;
  if (hasQuestion) {
    const oneLine = firstQ.replace(/\s+/g, " ").trim();
    need = titleCase(oneLine.length > 90 ? oneLine.slice(0, 88).trimEnd() + "…" : oneLine);
  } else if (turns.length === 0) {
    // Transcript didn't parse into turns; show its first line, not nothing.
    need = firstNonEmptyLine(transcript) || "Conversation";
  } else {
    need = "No question asked";
  }

  const haystack = `${questions.join(" ")} ${transcript}`;
  const theme = hasQuestion ? matchTheme(haystack) : THEME_OTHER;

  // Status: with no real question it's "incomplete" (a greeting, test, or
  // drop-off). With a question, the heuristic can tell "resolved" from "needs a
  // person" by whether the assistant referred out or hedged. "bot_gap" takes
  // judgement, so it only ever comes from the AI provider.
  const status: ConversationStatus = !hasQuestion
    ? "incomplete"
    : REFERRAL_RE.test(botText)
      ? "needs_follow_up"
      : "resolved";

  let summary: string;
  if (!hasQuestion) {
    summary = "The person opened the chat but did not ask for anything.";
  } else {
    const topic = need.replace(/…$/, "").toLowerCase();
    summary =
      status === "needs_follow_up"
        ? `Asked about ${topic}. The assistant pointed to another service, so this need was not fully met.`
        : `Asked about ${topic}. The assistant answered.`;
  }

  return { need, theme, status, summary, language };
}

// ── AI synthesis (Cloudflare or Claude — env-gated, defensive) ────────────────
//
// Enable with CONVERSATION_SYNTHESIS=ai. The provider is auto-detected so no
// credential is ever read here — set them in the environment:
//   • Cloudflare — CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN, plus
//     CLOUDFLARE_AI_MODEL: a Workers AI model ("@cf/meta/llama-3.1-8b-instruct")
//     OR, via Unified Billing, a third-party one ("anthropic/claude-haiku-4-5").
//     No provider key — Cloudflare bills your account.
//   • Anthropic direct — ANTHROPIC_API_KEY (optional ANTHROPIC_MODEL, or
//     ANTHROPIC_BASE_URL to proxy a BYOK key through your own AI Gateway).
// One pass per conversation → {need, theme, status, summary}. Every path returns
// null on any problem so the caller falls back to the heuristic — never throws.

const AI_PROVIDER: "cloudflare" | "anthropic" | null =
  process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN
    ? "cloudflare"
    : process.env.ANTHROPIC_API_KEY
      ? "anthropic"
      : null;

const AI_ENABLED = process.env.CONVERSATION_SYNTHESIS === "ai" && AI_PROVIDER !== null;

// Cap each AI round-trip so one slow/hung provider call can't block the whole
// page — on timeout the fetch aborts, we catch, and that conversation falls
// back to the heuristic instead of leaving the render hanging.
const AI_TIMEOUT_MS = 8000;

function synthesisPrompt(transcript: string): string {
  return (
    `You read a help-assistant (Carebot) transcript for the Lisbon Project, a charity supporting migrants and refugees. ` +
    `The team reads these to understand what people need, to follow up in time, and to spot where the assistant should improve. ` +
    `The assistant can only share self-serve links (its "AdminHub" pages and an external contacts list) and its office hours. It cannot do anything on the person's behalf. ` +
    `Personal details are already hidden as [email]/[phone]. ` +
    `Respond with ONLY minified JSON: {"need":string,"theme":string,"status":string,"summary":string}.\n` +
    `"need": at most 8 words naming the MAIN reason the person reached out. Use their FIRST real request, the one they led with. ` +
    `If they raised several things, keep the first and most important one and ignore topics they only browsed afterwards. ` +
    `Never the language, a name, or contact details.\n` +
    `"theme": exactly one of ${JSON.stringify(THEME_NAMES)}, chosen for that main need.\n` +
    `"status": one of\n` +
    `"resolved" = the assistant routed the person to the right resource for what they asked, for example the AdminHub page for that exact topic. The assistant's job is to point people to the correct self-serve resource, so doing that for the topic asked counts as resolved.\n` +
    `"needs_follow_up" = an UNMET need the assistant could not meet itself. Either it said this is not something the Lisbon Project handles and there is no resource for it (for example legal advice), OR the need is urgent or sensitive (a sick child, homelessness, safety, a legal deadline) and only a general link was shared. The chat is anonymous so the person cannot be contacted; these are the needs the team should be aware of and may want to prepare for or build resources for.\n` +
    `"bot_gap" = the assistant clearly mishandled a clear request: it answered the wrong topic, gave wrong information, or ignored a clear question the person asked.\n` +
    `"incomplete" = the person never clearly asked for help or chose a topic: they only greeted, chose a language, or gave a name (or one unclear line) and then stopped.\n` +
    `Rules: choosing a numbered menu topic (Finances, Housing) IS a real need, never "incomplete". ` +
    `Asking once for the person's name during the opening is normal onboarding, NOT a bot_gap. ` +
    `The assistant always ends by mentioning its office hours and an external contacts list; that standard footer alone does not make a conversation "needs_follow_up" or "resolved". Judge by whether the person's specific need was actually met.\n` +
    `"summary": one plain sentence for the team stating the person's main need and what the assistant actually did about it (answered it, pointed to external help, asked for a name, repeated the menu, and so on). ` +
    `Be concrete and honest about whether the person was helped. Write clearly, with no jargon, and do not use dashes.` +
    `\n\nTRANSCRIPT:\n${transcript.slice(0, 6000)}`
  );
}

async function callCloudflare(prompt: string): Promise<string | null> {
  // Two endpoints, chosen by the model so the smallest token works:
  //   • "@cf/…" Workers AI models → /ai/run/{model}; a plain Workers AI token is
  //     enough (the one-click "Workers AI" API-token template), free-tier billed.
  //   • third-party models ("anthropic/claude-…") → the unified
  //     /ai/v1/chat/completions endpoint via AI Gateway Unified Billing (needs an
  //     AI Gateway token + credits). Same account + token env either way; no
  //     provider key.
  const account = process.env.CLOUDFLARE_ACCOUNT_ID as string;
  const token = process.env.CLOUDFLARE_API_TOKEN as string;
  const model = process.env.CLOUDFLARE_AI_MODEL || "@cf/google/gemma-4-26b-a4b-it";
  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${token}`,
  };

  if (model.startsWith("@cf/")) {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], max_tokens: 300 }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      }
    );
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success?: boolean;
      result?: {
        response?: unknown;
        choices?: { message?: { content?: string } }[];
      };
    };
    if (!json.success) return null;
    // Newer @cf models reply in chat shape (choices[].message.content); older ones
    // put the text in `response`; and when the model emits valid JSON, Cloudflare
    // pre-parses it into `response` as an object — cover all three.
    const r = json.result;
    const content = r?.choices?.[0]?.message?.content;
    if (typeof content === "string") return content;
    if (typeof r?.response === "string") return r.response;
    if (r?.response != null) return JSON.stringify(r.response);
    return null;
  }

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/ai/v1/chat/completions`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ model, max_tokens: 300, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    }
  );
  if (!res.ok) return null;
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return json.choices?.[0]?.message?.content ?? null;
}

async function callAnthropic(prompt: string): Promise<string | null> {
  // Direct Anthropic, or — when ANTHROPIC_BASE_URL is set to a Cloudflare AI
  // Gateway endpoint (…/{account}/{gateway}/anthropic) — the same Claude call
  // routed through your Cloudflare for caching, analytics and unified billing.
  // Same request either way; only the base URL changes.
  const base = process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com";
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY as string,
    "anthropic-version": "2023-06-01",
  };
  // Only needed if the gateway is set to "authenticated".
  if (process.env.CLOUDFLARE_AIG_TOKEN) {
    headers["cf-aig-authorization"] = `Bearer ${process.env.CLOUDFLARE_AIG_TOKEN}`;
  }
  const res = await fetch(`${base}/v1/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(AI_TIMEOUT_MS),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { content?: { text?: string }[] };
  return json.content?.[0]?.text ?? null;
}

function parseInsight(
  text: string | null,
  language: string | null
): ConversationInsight | null {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as Partial<ConversationInsight>;
    if (!parsed.need || !parsed.summary) return null;
    const status: ConversationStatus = (
      ["resolved", "needs_follow_up", "bot_gap", "incomplete"] as const
    ).includes(parsed.status as ConversationStatus)
      ? (parsed.status as ConversationStatus)
      : "resolved";
    return {
      need: titleCase(String(parsed.need)),
      theme: THEME_NAMES.includes(String(parsed.theme)) ? String(parsed.theme) : THEME_OTHER,
      status,
      summary: String(parsed.summary),
      language,
    };
  } catch {
    return null;
  }
}

async function synthesizeAI(
  turns: Turn[],
  transcript: string
): Promise<ConversationInsight | null> {
  if (!AI_ENABLED) return null;
  try {
    const language = synthesizeHeuristic(turns, transcript).language; // cheap + reliable
    const prompt = synthesisPrompt(transcript);
    const text =
      AI_PROVIDER === "cloudflare"
        ? await callCloudflare(prompt)
        : await callAnthropic(prompt);
    return parseInsight(text, language);
  } catch {
    return null; // network / parse error → heuristic fallback
  }
}

// ── durable "analyse once" cache (conversation-insights collection) ──────────

/** Stable fingerprint of a transcript — a changed transcript re-synthesises. */
function transcriptHash(transcript: string): string {
  return createHash("sha1").update(transcript).digest("hex");
}

/** The model string stored as provenance on a freshly synthesised insight. */
function currentModel(): string {
  if (AI_PROVIDER === "cloudflare") {
    return process.env.CLOUDFLARE_AI_MODEL || "@cf/google/gemma-4-26b-a4b-it";
  }
  if (AI_PROVIDER === "anthropic") {
    return process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";
  }
  return "heuristic";
}

/**
 * Load cached insights for these transcript hashes in a single query, returning
 * a hash→insight map. Content-addressed: the transcript is the key, so a
 * conversation with no conversation_id still caches, and identical transcripts
 * share one entry.
 */
async function loadCachedInsights(
  payload: Payload,
  hashes: string[]
): Promise<Map<string, ConversationInsight>> {
  const map = new Map<string, ConversationInsight>();
  const keys = [...new Set(hashes)];
  if (keys.length === 0) return map;
  try {
    const { docs } = await payload.find({
      collection: "conversation-insights",
      where: { transcriptHash: { in: keys } },
      limit: keys.length,
      pagination: false,
      depth: 0,
    });
    for (const d of docs) {
      map.set(String(d.transcriptHash), {
        need: String(d.need),
        theme: String(d.theme),
        status: d.status as ConversationStatus,
        summary: String(d.summary),
        language: (d.language as string | null) ?? null,
      });
    }
  } catch {
    // A cache-read failure just means we synthesise fresh this time.
  }
  return map;
}

/** Store a freshly synthesised (AI) insight so this transcript is never recomputed. */
async function saveInsight(
  payload: Payload,
  hash: string,
  conversationId: string,
  insight: ConversationInsight
): Promise<void> {
  try {
    await payload.create({
      collection: "conversation-insights",
      data: {
        transcriptHash: hash,
        conversationId: conversationId || undefined,
        need: insight.need,
        theme: insight.theme,
        status: insight.status,
        summary: insight.summary,
        language: insight.language ?? undefined,
        model: currentModel(),
      },
    });
  } catch {
    // Best-effort: a duplicate-hash race or write failure must never break the
    // page — the insight is still returned for this render either way.
  }
}

// ── build the whole view (per-conversation insight + aggregates) ─────────────

export async function buildConversationsView(
  raw: RawConversation[],
  payload?: Payload
): Promise<ConversationsView> {
  // Read the durable cache first (content-addressed by transcript hash), so an
  // already-analysed transcript is served from Postgres and never re-sent to the AI.
  const hashes = raw.map((c) => transcriptHash(c.transcript));
  const cached = payload
    ? await loadCachedInsights(payload, hashes)
    : new Map<string, ConversationInsight>();

  let anyAI = false;

  // Synthesise the cache misses in parallel — one AI round-trip each, so the page
  // waits ~1 request, not N. Each falls back to the heuristic on its own.
  const conversations: EnrichedConversation[] = await Promise.all(
    raw.map(async (c, i) => {
      const turns = parseTranscript(c.transcript);
      const questionCount = countRealQuestions(turns);
      const hash = hashes[i];
      const hit = cached.get(hash);

      let insight: ConversationInsight;
      if (questionCount === 0) {
        // Nothing was actually asked (greeting, test, or drop-off). Skip the AI
        // entirely: there's no need to interpret, and it stops these from being
        // mislabelled as "bot_gap". The heuristic marks them "incomplete".
        insight = synthesizeHeuristic(turns, c.transcript);
      } else if (hit) {
        insight = hit; // already analysed — no AI call
        anyAI = true; // only AI results are ever cached
      } else {
        const ai = await synthesizeAI(turns, c.transcript);
        insight = ai ?? synthesizeHeuristic(turns, c.transcript);
        // Persist only AI results: the heuristic is cheap and deterministic, and
        // caching it would pin the team to it once the AI comes online.
        if (ai) {
          anyAI = true;
          if (payload) await saveInsight(payload, hash, c.conversationId, ai);
        }
      }

      return {
        conversationId: c.conversationId,
        at: c.at,
        turns,
        questionCount,
        insight,
      };
    })
  );
  const usedAI = anyAI;

  // Aggregates: rank themes and languages by frequency; count the actionable ones.
  // "incomplete" conversations expressed no need, so they're kept out of the Top
  // needs ranking (they'd otherwise inflate "Other / general") and counted apart.
  const themeCounts = new Map<string, number>();
  const langCounts = new Map<string, number>();
  let followUpCount = 0;
  let botGapCount = 0;
  let incompleteCount = 0;
  for (const c of conversations) {
    const { theme, status, language } = c.insight;
    if (language) langCounts.set(language, (langCounts.get(language) ?? 0) + 1);
    if (status === "incomplete") {
      incompleteCount++;
      continue;
    }
    themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1);
    if (status === "needs_follow_up") followUpCount++;
    if (status === "bot_gap") botGapCount++;
  }
  const rank = (m: Map<string, number>) =>
    [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  return {
    conversations,
    themes: rank(themeCounts),
    languages: rank(langCounts),
    followUpCount,
    botGapCount,
    incompleteCount,
    total: conversations.length,
    synthesizedBy: usedAI ? "ai" : "heuristic",
  };
}
