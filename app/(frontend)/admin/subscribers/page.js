import { redirect } from "next/navigation";

import { authedPayload } from "@/lib/admin-auth";
import { listMailerLiteSubscribers } from "@/lib/mailerlite";
import { SubscribersList } from "./subscribers-list";

export const metadata = {
  title: "Subscribers · Admin",
};

// Preformat the date on the server so the table can't trigger a locale
// hydration mismatch; the ISO string is what the CSV export writes.
function dateFields(iso) {
  const dt = iso ? new Date(iso) : null;
  return {
    dateLabel: dt
      ? dt.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "",
    dateISO: iso || "",
  };
}

// The team's newsletter list. MailerLite is the source of truth once connected
// (components/site/newsletter-actions.js posts signups there); while the key is
// unset, signups fall back to the Payload `subscribers` table, so this view
// falls back to reading it too. Either way the team sees their list without
// leaving /admin.
export default async function AdminSubscribersPage() {
  const { payload, user } = await authedPayload();
  // Subscriber emails are personal data — admin-only, same tier as the Team page.
  if (user.role !== "admin") redirect("/admin");

  const ml = await listMailerLiteSubscribers();

  if (ml.ok) {
    const subscribers = ml.subscribers.map((s) => ({
      id: s.id,
      email: s.email,
      firstName: s.name,
      status: s.status,
      ...dateFields(s.subscribedAt),
    }));

    // Surface any signups still sitting in the local fallback (captured before
    // MailerLite was connected) so they get exported + imported, not forgotten.
    const local = await payload
      .count({ collection: "subscribers" })
      .catch(() => ({ totalDocs: 0 }));

    return (
      <SubscribersList
        subscribers={subscribers}
        total={subscribers.length}
        source="mailerlite"
        truncated={ml.truncated}
        pendingLocal={local.totalDocs || 0}
      />
    );
  }

  // MailerLite unconfigured (or a transient error): show the local fallback
  // table — the signups captured while the integration was parked.
  const { docs, totalDocs } = await payload.find({
    collection: "subscribers",
    sort: "-createdAt",
    limit: 0,
    depth: 0,
  });

  const subscribers = docs.map((d) => ({
    id: d.id,
    email: d.email,
    firstName: d.firstName || "",
    source: d.source || "",
    ...dateFields(d.createdAt),
  }));

  return (
    <SubscribersList
      subscribers={subscribers}
      total={totalDocs}
      source="local"
      notConfigured={ml.status === "not_configured"}
    />
  );
}
