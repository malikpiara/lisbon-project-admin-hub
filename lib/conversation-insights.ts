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

export type Turn = {
  speaker: string;
  role: "user" | "bot";
  text: string;
  isGreeting?: boolean;
};

export type ConversationStatus = "resolved" | "needs_follow_up" | "bot_gap";

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
    // Transcript didn't parse into turns — show its first line, not nothing.
    need = firstNonEmptyLine(transcript) || "Conversation";
  } else {
    need = "No specific need stated";
  }

  const haystack = `${questions.join(" ")} ${transcript}`;
  const theme = hasQuestion ? matchTheme(haystack) : THEME_OTHER;

  // Status: heuristic can tell "resolved" from "needs a human" by whether the
  // assistant referred out / hedged. bot_gap needs judgement, so it only comes
  // from the AI provider.
  const status: ConversationStatus =
    hasQuestion && REFERRAL_RE.test(botText) ? "needs_follow_up" : "resolved";

  const summary = hasQuestion
    ? `Asked about ${need.replace(/…$/, "").toLowerCase()}.${
        status === "needs_follow_up"
          ? " The assistant pointed elsewhere — may need a human."
          : ""
      }`
    : "No specific question was asked — mostly a greeting, name or contact details.";

  return { need, theme, status, summary, language };
}

// ── AI synthesis (Cloudflare Workers AI or Claude — env-gated, defensive) ─────
//
// Enable with CONVERSATION_SYNTHESIS=ai. The provider is auto-detected so no
// credential ever needs to be read here — set them in the environment:
//   • Cloudflare Workers AI  → CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN
//                              (optional CLOUDFLARE_AI_MODEL, default below)
//   • Anthropic Claude       → ANTHROPIC_API_KEY (optional ANTHROPIC_MODEL)
// One pass per conversation → {need, theme, status, summary}. Every path returns
// null on any problem so the caller falls back to the heuristic — never throws.

const AI_PROVIDER: "cloudflare" | "anthropic" | null =
  process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN
    ? "cloudflare"
    : process.env.ANTHROPIC_API_KEY
      ? "anthropic"
      : null;

const AI_ENABLED = process.env.CONVERSATION_SYNTHESIS === "ai" && AI_PROVIDER !== null;

function synthesisPrompt(transcript: string): string {
  return (
    `You classify a migrant-support help-assistant transcript for a caseworker team. ` +
    `Personal details are already redacted as [email]/[phone]. ` +
    `Respond with ONLY minified JSON: {"need":string,"theme":string,"status":string,"summary":string}. ` +
    `"need": at most 8 words naming what the person needed — never the language, a name, or contact details. ` +
    `"theme": exactly one of ${JSON.stringify(THEME_NAMES)}. ` +
    `"status": "resolved" (assistant answered well), "needs_follow_up" (a human should reach out), or "bot_gap" (assistant answered poorly, wrongly or off-topic). ` +
    `"summary": one sentence — the ask and what the assistant did.\n\nTRANSCRIPT:\n${transcript.slice(0, 6000)}`
  );
}

async function callCloudflare(prompt: string): Promise<string | null> {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID as string;
  const model = process.env.CLOUDFLARE_AI_MODEL || "@cf/meta/llama-3.1-8b-instruct";
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${account}/ai/run/${model}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN as string}`,
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      }),
    }
  );
  if (!res.ok) return null;
  const json = (await res.json()) as {
    result?: { response?: string };
    success?: boolean;
  };
  return json.success ? json.result?.response ?? null : null;
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
    const status: ConversationStatus =
      parsed.status === "needs_follow_up" || parsed.status === "bot_gap"
        ? parsed.status
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

// ── build the whole view (per-conversation insight + aggregates) ─────────────

export async function buildConversationsView(
  raw: RawConversation[]
): Promise<ConversationsView> {
  const conversations: EnrichedConversation[] = [];
  let usedAI = false;

  for (const c of raw) {
    const turns = parseTranscript(c.transcript);
    const insight = (await synthesizeAI(turns, c.transcript)) ?? synthesizeHeuristic(turns, c.transcript);
    if (AI_ENABLED) usedAI = true;
    const questionCount = countRealQuestions(turns);
    conversations.push({
      conversationId: c.conversationId,
      at: c.at,
      turns,
      questionCount,
      insight,
    });
  }

  // Aggregates: rank themes and languages by frequency; count the actionable ones.
  const themeCounts = new Map<string, number>();
  const langCounts = new Map<string, number>();
  let followUpCount = 0;
  let botGapCount = 0;
  for (const c of conversations) {
    const { theme, status, language } = c.insight;
    themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1);
    if (language) langCounts.set(language, (langCounts.get(language) ?? 0) + 1);
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
    total: conversations.length,
    synthesizedBy: usedAI ? "ai" : "heuristic",
  };
}
