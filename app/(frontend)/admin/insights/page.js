import { authedPayload } from "@/lib/admin-auth";
import { TopicsViewedChart } from "@/components/analytics/topics-viewed-chart";
import { ContactsSearchesTable } from "@/components/analytics/contacts-searches-table";
import { ChatbotSummaryCard } from "@/components/analytics/chatbot-summary-card";
import {
  getChatbotStats,
  getContactsSearches,
  getTopicsViewed,
  isInsightsConfigured,
} from "@/lib/posthog-insights";

export const metadata = {
  title: "Insights · Lisbon Project",
};

// Team-only analytics, under the /admin group — so it inherits the admin
// layout's Payload-auth gate and shared sidebar, and re-checks auth itself
// (defense in depth). Kept in the (frontend) group (not the Payload admin app)
// so the design system is available for the DS-styled charts.
//
// Data is read server-side from PostHog's Query API (see lib/posthog-insights).
// Until POSTHOG_PERSONAL_API_KEY is set, every query returns null and the two
// demo panels fall back to their built-in sample data — so the page is never
// broken, just not yet live.
export default async function InsightsPage() {
  const { user } = await authedPayload();

  const configured = isInsightsConfigured();
  const [topics, searches, gaps, chatbot] = await Promise.all([
    getTopicsViewed(),
    getContactsSearches(),
    getContactsSearches({ zeroResultsOnly: true }),
    getChatbotStats(),
  ]);

  // Live counts when configured (a failed call → [] → honest empty state, never
  // fake numbers on a real dashboard). Pre-config → undefined → the component's
  // sample data, a labelled demo. The content-gaps panel never shows samples:
  // a made-up "gap" would send the team chasing something no one searched for.
  const live = (rows) => (configured ? (rows ?? []) : undefined);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-8">
        <h1 className="font-heading text-ds-xxl font-bold text-brand-dark">
          Insights
        </h1>
        <p className="mt-2 text-ds-s text-muted-foreground">
          Team-only analytics · signed in as {user.email}
        </p>
      </header>

      {/* "What do people need that we're not giving them?" — the two most
          actionable panels, side by side: failed searches and what people ask
          the assistant. */}
      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
        <ContactsSearchesTable
          data={configured ? (gaps ?? []) : []}
          title="Searches we couldn't answer"
          description="People searched All Contacts and found nothing · last 30 days"
          caption={
            <>
              Each row is a gap to close — a contact to add or surface. From{" "}
              <code>contacts_searched</code> where <code>results_count = 0</code>.
            </>
          }
          emptyLabel={
            configured
              ? "No content gaps this period — every search found a match."
              : "Set POSTHOG_PERSONAL_API_KEY to surface real content gaps here."
          }
        />
        <ChatbotSummaryCard
          conversations={chatbot ? chatbot.conversations : null}
          opens={chatbot ? chatbot.opens : null}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
        <TopicsViewedChart data={live(topics)} />
        <ContactsSearchesTable
          data={live(searches)}
          caption="Live from the contacts_searched PostHog event · last 30 days."
        />
      </div>
    </main>
  );
}
