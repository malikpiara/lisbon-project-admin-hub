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

// One page is 100 subscribers (the API max); the cap bounds a runaway loop at
// 2,500. `truncated` tells the caller it hit the cap so the UI can say so rather
// than silently show a partial list.
const LIST_PAGE_SIZE = 100;
const LIST_MAX_PAGES = 25;

/**
 * List subscribers from MailerLite, following cursor pagination. Never throws —
 * returns a status the caller branches on, mirroring addMailerLiteSubscriber, so
 * the subscribers page can fall back to the local table when unconfigured.
 *
 * @returns {Promise<{
 *   ok: boolean,
 *   status: "ok" | "not_configured" | "error",
 *   subscribers: Array<{ id: string, email: string, name: string, status: string, subscribedAt: string | null }>,
 *   truncated: boolean,
 * }>}
 */
export async function listMailerLiteSubscribers() {
  const apiKey = process.env.MAILERLITE_API_KEY;
  const empty = { subscribers: [], truncated: false };
  if (!apiKey) return { ok: false, status: "not_configured", ...empty };

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };

  const subscribers = [];
  // `links.next` is a full URL (with the cursor baked in) or null on the last
  // page — the documented cursor-pagination contract for this endpoint.
  let url = `${API_URL}?limit=${LIST_PAGE_SIZE}`;
  let truncated = false;

  try {
    for (let page = 0; url; page++) {
      if (page >= LIST_MAX_PAGES) {
        truncated = true;
        break;
      }
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error("MailerLite list failed:", res.status, detail);
        return { ok: false, status: "error", ...empty };
      }
      const json = await res.json();
      for (const s of json.data || []) {
        subscribers.push({
          id: String(s.id),
          email: s.email || "",
          // We store the signup's first name in MailerLite's `name` field on
          // subscribe (see addMailerLiteSubscriber).
          name: s.fields?.name || "",
          status: s.status || "",
          subscribedAt: s.subscribed_at || s.created_at || null,
        });
      }
      url = json.links?.next || null;
    }
    return { ok: true, status: "ok", subscribers, truncated };
  } catch (err) {
    console.error("MailerLite list threw:", err);
    return { ok: false, status: "error", ...empty };
  }
}
