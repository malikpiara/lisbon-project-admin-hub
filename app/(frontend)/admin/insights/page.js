import { authedPayload } from "@/lib/admin-auth";
import { TopicsViewedChart } from "@/components/analytics/topics-viewed-chart";
import { ContactsSearchesTable } from "@/components/analytics/contacts-searches-table";
import { ChatbotSummaryCard } from "@/components/analytics/chatbot-summary-card";
import { Tag } from "@/components/ui/tag";
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
  await authedPayload(); // auth gate (redirects to /login when unauthenticated)

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
  const gapsData = configured ? (gaps ?? []) : [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <header className="mb-10">
        <h1 className="font-heading text-ds-xxl font-bold text-brand-dark">
          Insights
        </h1>
        <p className="mt-2 text-ds-s text-muted-foreground">
          What people are looking for — and what we couldn&rsquo;t answer yet.
        </p>
      </header>

      {/* HERO — the one panel to act on: searches that found nothing. Each row
          is someone we couldn't help. Full-width + a count so it's the
          unmistakable focal point of the page. */}
      <ContactsSearchesTable
        data={gapsData}
        title="Searches we couldn't answer"
        description="People searched All Contacts and found nothing · last 30 days"
        headerAction={
          gapsData.length > 0 ? <Tag>{gapsData.length} to close</Tag> : null
        }
        caption={
          <>
            Each row is a gap to close — a contact to add or surface. From{" "}
            <code>contacts_searched</code> where <code>results_count = 0</code>.
          </>
        }
        emptyLabel={
          configured
            ? "Nice — every search found a match this period."
            : "Set POSTHOG_PERSONAL_API_KEY to surface real content gaps here."
        }
      />

      {/* Supporting layer — everything below the hero is context. Grouped under
          one quiet eyebrow and pushed down (mt-12 group break > gap-8 within) so
          the hero stays the headline and this reads as "the bigger picture". */}
      <section className="mt-12">
        <h2 className="mb-4 text-ds-xxs font-semibold uppercase tracking-wide text-muted-foreground">
          Supporting signals
        </h2>

        {/* Demand — what people are looking for and asking. */}
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
          <ContactsSearchesTable
            data={live(searches)}
            caption="Live from the contacts_searched PostHog event · last 30 days."
          />
          <ChatbotSummaryCard
            conversations={chatbot ? chatbot.conversations : null}
            opens={chatbot ? chatbot.opens : null}
          />
        </div>

        {/* Supply — what people actually read. */}
        <div className="mt-8">
          <TopicsViewedChart data={live(topics)} />
        </div>
      </section>
    </main>
  );
}
