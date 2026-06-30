import { authedPayload } from "@/lib/admin-auth";
import { TopicsViewedChart } from "@/components/analytics/topics-viewed-chart";
import { ContactsSearchesTable } from "@/components/analytics/contacts-searches-table";

export const metadata = {
  title: "Insights · Lisbon Project",
};

// Team-only analytics, now under the /admin group — so it inherits the admin
// layout's Payload-auth gate and the shared sidebar. It re-checks auth itself
// too (defense in depth), reading the same session cookie as /cms-admin. Kept in
// the (frontend) group (not the Payload admin app) so the design system is
// available to render the DS-styled charts. Wire the chart's `data` prop to the
// `topic_viewed` PostHog insight for live counts.
export default async function InsightsPage() {
  const { user } = await authedPayload();

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
      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
        <TopicsViewedChart />
        <ContactsSearchesTable />
      </div>
    </main>
  );
}
