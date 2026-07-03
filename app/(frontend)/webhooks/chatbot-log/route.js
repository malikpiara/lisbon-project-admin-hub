// Server-side sink for Zapier chatbot transcripts → PostHog.
//
// The chat runs in a cross-origin Zapier iframe, so the message text is
// unreadable from our client (same-origin policy). Instead a Zapier "Run Zap"
// step — which fires when a conversation ends — POSTs the full transcript here,
// and we forward it to PostHog. Owning this seam (rather than wiring Zapier
// straight to PostHog) gives us one place to authenticate the caller, redact
// obvious PII, and keep person profiles off. Full setup + the Zap recipe live
// in docs/ANALYTICS.md.
//
// Mounted at /webhooks/chatbot-log (not /api/*, which Payload's catch-all owns).

const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const WEBHOOK_SECRET = process.env.CHATBOT_LOG_SECRET;

// Ceiling on what we forward, not what we accept — a runaway Zap (or anyone who
// obtains the secret) shouldn't be able to stuff megabytes into PostHog.
// ~50k chars is far beyond any real conversation.
const MAX_TRANSCRIPT_CHARS = 50_000;

// Best-effort redaction of the most obvious direct identifiers. This is a floor,
// not a guarantee — on a site serving vulnerable people, treat the transcript as
// special-category data and keep retention short regardless.
function redact(text) {
  if (typeof text !== "string") return text;
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[phone]");
}

export async function POST(request) {
  // Refuse to behave as an open logging endpoint: with no secret configured we
  // can't authenticate the caller, so we accept nothing.
  if (!WEBHOOK_SECRET) {
    return Response.json(
      { error: "chatbot logging not configured" },
      { status: 503 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${WEBHOOK_SECRET}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  // No PostHog key → accept but no-op, so the Zap stays green in environments
  // where analytics isn't configured (mirrors the opt-in provider).
  if (!POSTHOG_KEY) return new Response(null, { status: 204 });

  const conversationId =
    body.conversation_id ?? body.conversationId ?? body.id ?? "unknown";
  const transcript = redact(String(body.transcript ?? "")).slice(
    0,
    MAX_TRANSCRIPT_CHARS,
  );

  let res;
  try {
    res = await fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event: "chatbot_conversation_logged",
        // Conversation id, not a person: the web session's distinct_id is
        // unreachable from Zapier, so these events stand alone by design.
        distinct_id: conversationId,
        properties: {
          conversation_id: conversationId,
          transcript,
          // Don't build an identifiable person profile from chatbot data.
          $process_person_profile: false,
        },
      }),
    });
  } catch {
    // Network failure reaching PostHog — a 502 (not an opaque 500) tells the
    // Zap it can retry.
    return Response.json({ error: "posthog unreachable" }, { status: 502 });
  }

  if (!res.ok) {
    return Response.json(
      { error: "posthog capture failed", status: res.status },
      { status: 502 },
    );
  }

  return new Response(null, { status: 204 });
}
