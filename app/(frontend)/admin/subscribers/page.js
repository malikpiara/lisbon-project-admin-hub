import { redirect } from "next/navigation";

import { authedPayload } from "@/lib/admin-auth";
import { SubscribersList } from "./subscribers-list";

export const metadata = {
  title: "Subscribers · Admin",
};

// Newsletter signups captured locally while MailerLite is parked
// (components/site/newsletter-actions.js falls back to the `subscribers`
// collection until MAILERLITE_API_KEY is set). This read-only view exists so
// the team can see those signups and export them — the CSV is the one-time
// import source for MailerLite. Once MailerLite is live and this table has been
// drained, the collection can be retired.
export default async function AdminSubscribersPage() {
  const { payload, user } = await authedPayload();
  // Subscriber emails are personal data — admin-only, same tier as the Team page.
  if (user.role !== "admin") redirect("/admin");

  const { docs, totalDocs } = await payload.find({
    collection: "subscribers",
    sort: "-createdAt",
    // limit: 0 returns every row (no pagination). The list is finite and small,
    // and truncating it before the one-time MailerLite import would silently
    // drop signups — so fetch all of them.
    limit: 0,
    depth: 0,
  });

  const subscribers = docs.map((d) => {
    const dt = d.createdAt ? new Date(d.createdAt) : null;
    return {
      id: d.id,
      email: d.email,
      firstName: d.firstName || "",
      source: d.source || "",
      // Preformatted on the server so the table can't trigger a locale
      // hydration mismatch; the ISO string is what the CSV export writes.
      dateLabel: dt
        ? dt.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "",
      dateISO: d.createdAt || "",
    };
  });

  return <SubscribersList subscribers={subscribers} total={totalDocs} />;
}
