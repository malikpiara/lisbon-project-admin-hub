import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import { TopicsViewedChart } from "@/components/analytics/topics-viewed-chart";
import { ContactsSearchesTable } from "@/components/analytics/contacts-searches-table";

export const metadata = {
  title: "Insights · Lisbon Project",
};

// Team-only analytics. Gated by Payload auth — reads the same session cookie as
// /cms-admin, so only signed-in team members can view it. Lives in the
// (frontend) route group (NOT the Payload admin) so globals.css / Tailwind / the
// design system are available to render the DS-styled chart. Wire the chart's
// `data` prop to the `topic_viewed` PostHog insight for live counts.
export default async function InsightsPage() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });

  if (!user) {
    redirect("/cms-admin/login");
  }

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
