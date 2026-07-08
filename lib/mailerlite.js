// MailerLite integration for newsletter signups.
//
// The Lisbon Project is migrating its *website* off MailerLite (onto this app)
// but keeps MailerLite as the *sending* platform, so it stays the single source
// of truth for newsletter subscribers (sends, unsubscribes, segments, and
// MailerLite's own double opt-in all live there).
//
// PARKED until credentials exist. Set MAILERLITE_API_KEY (and optionally
// MAILERLITE_GROUP_ID to file signups into a specific group) to activate — same
// "leave empty to disable" pattern as the PostHog keys. While unset this is a
// no-op returning { ok: false, status: "not_configured" }, and the caller
// (components/site/newsletter-actions.js) falls back to capturing the signup
// locally so none are lost during the transition.
//
// Uses the current MailerLite API (connect.mailerlite.com). The create endpoint
// is an upsert — re-subscribing an existing email updates rather than errors.

const API_URL = "https://connect.mailerlite.com/api/subscribers";

/** @returns {boolean} whether a MailerLite API key is configured. */
export function isMailerLiteConfigured() {
  return Boolean(process.env.MAILERLITE_API_KEY);
}

/**
 * Upsert a subscriber into MailerLite (optionally into a group). Never throws —
 * failures are logged and returned so the caller can fall back.
 *
 * @param {{ email: string, firstName?: string }} input
 * @returns {Promise<{ ok: boolean, status: "subscribed" | "not_configured" | "error" }>}
 */
export async function addMailerLiteSubscriber({ email, firstName }) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_GROUP_ID;

  if (!apiKey) return { ok: false, status: "not_configured" };

  const body = {
    email,
    ...(firstName ? { fields: { name: firstName } } : {}),
    ...(groupId ? { groups: [groupId] } : {}),
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("MailerLite subscribe failed:", res.status, detail);
      return { ok: false, status: "error" };
    }
    return { ok: true, status: "subscribed" };
  } catch (err) {
    console.error("MailerLite subscribe threw:", err);
    return { ok: false, status: "error" };
  }
}

const GROUPS_URL = "https://connect.mailerlite.com/api/groups";
const RECENT_TIMEOUT_MS = 8000;

/**
 * Fetch a small, newest-first page of subscribers for a "recent signups" view.
 * The API returns newest-first by default, so page 1 IS the most recent — one
 * bounded request, no pagination (this is deliberately NOT a full-list fetch;
 * the full list stays in MailerLite). Never throws; an AbortController timeout
 * stops a slow API from hanging the admin page.
 *
 * Returns RAW emails — the caller MUST mask them before sending anything to the
 * client. When MAILERLITE_GROUP_ID is set it scopes to that group (i.e. website
 * signups) and returns the group's exact `active_count` as `total`; otherwise it
 * lists the whole account and `scoped:false` tells the UI to caveat that.
 *
 * @param {{ limit?: number }} [opts]
 * @returns {Promise<{ ok: boolean, status: "ok" | "not_configured" | "error", subscribers: Array<{ id: string, email: string, name: string, status: string, subscribedAt: string | null }>, total: number | null, scoped: boolean }>}
 */
export async function getRecentMailerLiteSubscribers({ limit = 25 } = {}) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_GROUP_ID;
  const scoped = Boolean(groupId);
  const base = { subscribers: [], total: null, scoped };
  if (!apiKey) return { ok: false, status: "not_configured", ...base };

  const headers = { Authorization: `Bearer ${apiKey}`, Accept: "application/json" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RECENT_TIMEOUT_MS);

  try {
    const listUrl = scoped
      ? `${GROUPS_URL}/${groupId}/subscribers?limit=${limit}`
      : `${API_URL}?limit=${limit}`;
    const res = await fetch(listUrl, { headers, signal: controller.signal });
    if (!res.ok) {
      console.error("MailerLite recent list failed:", res.status);
      return { ok: false, status: "error", ...base };
    }
    const json = await res.json();
    const subscribers = (json.data || []).map((s) => ({
      id: String(s.id),
      email: s.email || "",
      name: s.fields?.name || "",
      status: s.status || "",
      subscribedAt: s.subscribed_at || s.created_at || null,
    }));

    // A configured group has a cheap exact total via active_count.
    let total = null;
    if (scoped) {
      const gRes = await fetch(`${GROUPS_URL}/${groupId}`, {
        headers,
        signal: controller.signal,
      }).catch(() => null);
      if (gRes && gRes.ok) {
        const g = await gRes.json();
        total = g.data?.active_count ?? null;
      }
    }
    return { ok: true, status: "ok", subscribers, total, scoped };
  } catch (err) {
    console.error(
      "MailerLite recent list threw:",
      err && err.name === "AbortError" ? "timeout" : err
    );
    return { ok: false, status: "error", ...base };
  } finally {
    clearTimeout(timer);
  }
}
