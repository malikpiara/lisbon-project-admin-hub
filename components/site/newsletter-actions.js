"use server";

import { getPayload } from "payload";
import config from "@payload-config";

import { addMailerLiteSubscriber } from "@/lib/mailerlite";

// Rough shape check for a friendly message before we do any work. The
// collection's `email` field does the authoritative validation.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SUCCESS = {
  status: "success",
  message: "Thanks for subscribing! Look out for our next update.",
};

// Public newsletter signup from the site footer.
//
// Destination once live: MailerLite — the sending platform the Lisbon Project
// keeps after migrating the site here (its single source of truth for
// subscribers). MailerLite is PARKED until MAILERLITE_API_KEY is set; until
// then addMailerLiteSubscriber is a no-op and we capture the signup in the
// Payload `subscribers` collection (Postgres on Supabase) so none are lost
// during the transition — those rows are the import source for MailerLite later.
//
// The Local API bypasses access control, so the collection can stay closed to
// unauthenticated REST/GraphQL writes while this action still persists signups.
export async function subscribe(_prevState, formData) {
  const firstName = String(formData.get("firstName") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  if (!firstName) {
    return { status: "error", message: "Please tell us your first name." };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  // Preferred path: hand off to MailerLite (upsert — duplicates are fine).
  const ml = await addMailerLiteSubscriber({ email, firstName });
  if (ml.ok) return SUCCESS;

  // Fallback: MailerLite not configured yet (transition) or a transient failure.
  // Capture locally so the signup isn't lost.
  return captureLocally({ email, firstName });
}

async function captureLocally({ email, firstName }) {
  const payload = await getPayload({ config });

  // Idempotent: a repeat signup is a success, not a duplicate-key error.
  const existing = await payload.find({
    collection: "subscribers",
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
  });
  if (existing.totalDocs > 0) {
    return {
      status: "success",
      message: "You're already on the list — thanks for your interest!",
    };
  }

  try {
    await payload.create({
      collection: "subscribers",
      data: { email, firstName, source: "footer" },
    });
  } catch (err) {
    console.error("Newsletter signup failed:", err);
    return {
      status: "error",
      message: "Something went wrong on our end. Please try again.",
    };
  }

  return SUCCESS;
}
