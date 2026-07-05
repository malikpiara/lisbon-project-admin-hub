import { authedPayload } from "@/lib/admin-auth";
import { ChatbotConversations } from "@/components/analytics/chatbot-conversations";
import {
  getChatbotConversations,
  isInsightsConfigured,
} from "@/lib/posthog-insights";

export const metadata = {
  title: "Conversations · Admin",
};

// Team-only view of help-chatbot transcripts, captured server-side from Zapier
// (see docs/ANALYTICS.md → chatbot logging). Inherits the /admin Payload-auth
// gate; re-checks it here too. Reads from PostHog's Query API, so it stays empty
// until the capture Zap is live and POSTing transcripts to /webhooks/chatbot-log.
export default async function AdminConversationsPage() {
  await authedPayload(); // auth gate (redirects to /login when unauthenticated)

  const configured = isInsightsConfigured();
  const conversations = await getChatbotConversations();
  const data = conversations ?? [];

  const emptyLabel = configured
    ? "No conversations captured yet. Once the chatbot logging is live, conversations will appear here — with any emails and phone numbers automatically hidden."
    : "Set POSTHOG_PERSONAL_API_KEY to read captured conversations here.";

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-8">
        <h1 className="font-heading text-ds-xxl font-bold text-brand-dark">
          Assistant conversations
        </h1>
        <p className="mt-2 text-ds-s text-muted-foreground">
          What people ask the help chatbot · Personal details hidden · Team only
        </p>
        {data.length > 0 ? (
          <>
            <p className="mt-4 text-ds-xs font-semibold text-foreground">
              {data.length} conversation{data.length === 1 ? "" : "s"}
              <span className="font-normal text-muted-foreground">
                {" "}
                · most recent first
              </span>
            </p>
            <p className="mt-2 text-ds-xxs font-medium text-muted-foreground">
              To protect people&rsquo;s privacy, any email or phone number is
              automatically hidden and shown as{" "}
              <span className="font-semibold">[email]</span> or{" "}
              <span className="font-semibold">[phone]</span>.
            </p>
          </>
        ) : null}
      </header>

      <ChatbotConversations data={data} emptyLabel={emptyLabel} />
    </main>
  );
}
