import { redirect } from "next/navigation";

import { authedPayload } from "@/lib/admin-auth";
import { isMailerLiteConfigured } from "@/lib/mailerlite";
import { SubscribersList } from "./subscribers-list";

export const metadata = {
  title: "Subscribers · Admin",
};

// The newsletter list lives in MailerLite once connected — site signups are
// posted there (components/site/newsletter-actions.js). This route deliberately
// does NOT fetch the MailerLite list: it's thousands of real subscribers' emails,
// and pulling that PII into the app (and the browser) on every load is both a
// privacy and a performance problem. MailerLite has its own UI + access controls
// for managing them, so we link out instead. All this route holds is the small
// set of signups captured *locally* before MailerLite was connected, so they can
// be exported, imported once, and the collection retired.
export default async function AdminSubscribersPage() {
  const { payload, user } = await authedPayload();
  // Subscriber emails are personal data — admin-only, same tier as the Team page.
  if (user.role !== "admin") redirect("/admin");

  const { docs, totalDocs } = await payload.find({
    collection: "subscribers",
    sort: "-createdAt",
    limit: 0,
    depth: 0,
  });

  const localSignups = docs.map((d) => {
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

  return (
    <SubscribersList
      localSignups={localSignups}
      localTotal={totalDocs}
      mailerliteConnected={isMailerLiteConfigured()}
    />
  );
}
