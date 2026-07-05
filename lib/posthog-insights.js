// Server-only reader for the team's /admin/insights dashboard.
//
// Asymmetry worth knowing: the `phc_` key (NEXT_PUBLIC_POSTHOG_KEY) can only
// WRITE events via /capture/. Reading them back for a dashboard needs a
// *Personal API Key* (`phx_…`, scoped to `query:read`) hitting the Query API —
// and that API lives on the app host (eu.posthog.com), NOT the ingestion host
// (eu.i.posthog.com). Both are optional: with no personal key configured every
// function returns null and the page falls back to sample data, mirroring the
// opt-in stance of the client SDK. Never import this from a client component —
// it would leak the personal key into the browser bundle.

import { redactPII } from "@/lib/redact-pii";

const PERSONAL_KEY = process.env.POSTHOG_PERSONAL_API_KEY;
const PROJECT_ID = process.env.POSTHOG_PROJECT_ID ?? "208396";

// The Query API is on the app origin, not the `i.` ingestion subdomain. Derive
// it from the ingestion host (eu.i.posthog.com → eu.posthog.com) unless an
// explicit override is set (self-host / reverse proxy).
const API_HOST =
  process.env.POSTHOG_API_HOST ??
  (process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com")
    .replace("://eu.i.", "://eu.")
    .replace("://us.i.", "://us.");

// The dashboard is team-facing but not real-time; one external call per load is
// fine. Cap it so a PostHog hiccup degrades to sample data instead of hanging
// the page.
const QUERY_TIMEOUT_MS = 6000;

// Reporting window shared by every panel.
const WINDOW_DAYS = 30;

/**
 * Run a HogQL query against the PostHog Query API.
 * @param {string} hogql
 * @returns {Promise<Array<Array<unknown>>|null>} result rows, or null when
 *   analytics isn't configured or the call fails (caller falls back to samples).
 */
async function runHogQL(hogql) {
  if (!PERSONAL_KEY) return null;

  let res;
  try {
    res = await fetch(`${API_HOST}/api/projects/${PROJECT_ID}/query/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PERSONAL_KEY}`,
      },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query: hogql } }),
      signal: AbortSignal.timeout(QUERY_TIMEOUT_MS),
      // The team wants current numbers; the page is already dynamic (auth-gated),
      // so keep this out of Next's data cache.
      cache: "no-store",
    });
  } catch {
    return null; // network error / timeout → fall back to samples
  }

  if (!res.ok) return null;

  try {
    const json = await res.json();
    return Array.isArray(json?.results) ? json.results : null;
  } catch {
    return null;
  }
}

/** True when the server has what it needs to show live (not sample) data. */
export function isInsightsConfigured() {
  return Boolean(PERSONAL_KEY);
}

/**
 * @typedef {{ topic: string, views: number }} TopicView
 * Unique viewers per information topic, most-viewed first.
 * @param {number} [limit]
 * @returns {Promise<TopicView[]|null>}
 */
export async function getTopicsViewed(limit = 8) {
  const rows = await runHogQL(`
    SELECT properties.topic_name AS topic, count(DISTINCT person_id) AS views
    FROM events
    WHERE event = 'topic_viewed'
      AND timestamp >= now() - INTERVAL ${Number(WINDOW_DAYS)} DAY
      AND properties.topic_name != ''
    GROUP BY topic
    ORDER BY views DESC
    LIMIT ${Number(limit)}
  `);
  if (!rows) return null;
  return rows.map((r) => ({ topic: String(r[0]), views: Number(r[1]) }));
}

/**
 * @typedef {{ query: string, searches: number }} ContactsSearch
 * Most-searched All Contacts queries. With `zeroResultsOnly`, only searches that
 * returned nothing — the content gaps the team can act on.
 * @param {{ zeroResultsOnly?: boolean, limit?: number }} [opts]
 * @returns {Promise<ContactsSearch[]|null>}
 */
export async function getContactsSearches(opts = {}) {
  const { zeroResultsOnly = false, limit = 20 } = opts;
  const gapClause = zeroResultsOnly ? "AND properties.results_count = 0" : "";
  const rows = await runHogQL(`
    SELECT properties.search_query AS query, count() AS searches
    FROM events
    WHERE event = 'contacts_searched'
      AND timestamp >= now() - INTERVAL ${Number(WINDOW_DAYS)} DAY
      AND properties.search_query != ''
      ${gapClause}
    GROUP BY query
    ORDER BY searches DESC
    LIMIT ${Number(limit)}
  `);
  if (!rows) return null;
  return rows.map((r) => ({ query: String(r[0]), searches: Number(r[1]) }));
}

/**
 * @typedef {{ conversationId: string, transcript: string, at: string }} ChatbotConversation
 * Recent help-chatbot conversations (PII-redacted transcripts), newest first.
 * These arrive server-side from Zapier via /webhooks/chatbot-log — the bot runs
 * in a cross-origin iframe, so the browser never sees this content. Special-
 * category data: this reader is behind the /admin auth gate for a reason.
 * @param {number} [limit]
 * @param {number} [days]
 * @returns {Promise<ChatbotConversation[]|null>}
 */
export async function getChatbotConversations(limit = 50, days = 90) {
  const rows = await runHogQL(`
    SELECT properties.conversation_id AS conversation_id,
           properties.transcript AS transcript,
           timestamp AS at
    FROM events
    WHERE event = 'chatbot_conversation_logged'
      AND timestamp >= now() - INTERVAL ${Number(days)} DAY
    ORDER BY at DESC
    LIMIT ${Number(limit)}
  `);
  if (!rows) return null;
  return rows.map((r) => ({
    conversationId: String(r[0] ?? ""),
    // Redact on read too (defense in depth): older rows captured before write-
    // time redaction — or anything the capture regex missed — are masked before
    // they ever reach a team member's screen. See lib/redact-pii.
    transcript: redactPII(String(r[1] ?? "")),
    at: String(r[2] ?? ""),
  }));
}

/**
 * @typedef {{ conversations: number, opens: number }} ChatbotStats
 * Counts for the /admin/insights summary tile over the window. `conversations`
 * is transcript captures (chatbot_conversation_logged, via Zapier);
 * `opens` is client-side engagement (chatbot_opened).
 * @param {number} [days]
 * @returns {Promise<ChatbotStats|null>}
 */
export async function getChatbotStats(days = 30) {
  const rows = await runHogQL(`
    SELECT
      countIf(event = 'chatbot_conversation_logged') AS conversations,
      countIf(event = 'chatbot_opened') AS opens
    FROM events
    WHERE event IN ('chatbot_conversation_logged', 'chatbot_opened')
      AND timestamp >= now() - INTERVAL ${Number(days)} DAY
  `);
  if (!rows || !rows[0]) return null;
  return { conversations: Number(rows[0][0]), opens: Number(rows[0][1]) };
}
