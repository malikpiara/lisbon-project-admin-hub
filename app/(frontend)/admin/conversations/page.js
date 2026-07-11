import { authedPayload } from "@/lib/admin-auth";
import { ChatbotConversations } from "@/components/analytics/chatbot-conversations";
import {
  getChatbotConversations,
  isInsightsConfigured,
} from "@/lib/posthog-insights";
import { buildConversationsView } from "@/lib/conversation-insights";

export const metadata = {
  title: "Conversations · Admin",
};

// Team-only view of the help assistant, captured server-side from Zapier (see
// docs/ANALYTICS.md → chatbot logging). Inherits the /admin Payload-auth gate.
// The page is framed around the team's real job — understanding what migrants
// need — so buildConversationsView synthesises a need/theme/status per transcript
// (heuristic today; AI when CONVERSATION_SYNTHESIS=ai + a key are set) and rolls
// them up into the "top needs" overview.
export default async function AdminConversationsPage() {
  const { payload } = await authedPayload(); // auth gate (redirects when unauthenticated)

  const configured = isInsightsConfigured();
  const conversations = await getChatbotConversations();
  // Pass Payload so each transcript is synthesised once and cached in the
  // conversation-insights collection — reloads read from Postgres, no AI re-run.
  const view = await buildConversationsView(conversations ?? [], payload);

  const emptyLabel = configured
    ? "Once people start chatting with the assistant, their needs will show up here. Any emails and phone numbers are hidden automatically."
    : "Set POSTHOG_PERSONAL_API_KEY to read captured conversations here.";

  return (
    <main className="mx-auto max-w-5xl px-8 pt-12 pb-28">
      <header className="mb-8">
        <h1 className="font-heading text-ds-xxl font-bold text-brand-dark">
          What people are asking for
        </h1>
        <p className="mt-2 max-w-2xl text-ds-s leading-relaxed text-muted-foreground">
          What people ask the help assistant, and whether they got the help they
          needed.
        </p>
        {view.total > 0 ? (
          <p className="mt-2 max-w-2xl text-ds-xxs font-medium text-muted-foreground">
            Personal details are hidden and shown as{" "}
            <span className="font-bold">[email]</span> or{" "}
            <span className="font-bold">[phone]</span>. Visible to the team only.
            {view.synthesizedBy === "heuristic"
              ? " Needs and status are inferred from each transcript."
              : null}
          </p>
        ) : null}
      </header>

      <ChatbotConversations view={view} emptyLabel={emptyLabel} />
    </main>
  );
}
