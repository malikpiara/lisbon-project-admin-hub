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
