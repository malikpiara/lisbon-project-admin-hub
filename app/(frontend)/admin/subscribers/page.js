import { redirect } from "next/navigation";

import { authedPayload } from "@/lib/admin-auth";
import {
  getRecentMailerLiteSubscribers,
  isMailerLiteConfigured,
} from "@/lib/mailerlite";
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

// Mask an email before it leaves the server: keep the first character and the
// domain, hide the rest (j•••@gmail.com). Admins viewing this can already see
// the full address in MailerLite, so this isn't access control — it's not
// needlessly serializing raw PII into the browser (and logs/DOM).
function maskEmail(email) {
  const [local, domain] = String(email || "").split("@");
  if (!domain) return "•••";
  return `${local.slice(0, 1)}•••@${domain}`;
}

// The full newsletter list lives in MailerLite (thousands of real subscribers).
// This route never fetches that whole list — it shows a small, newest-first
// "recent" page (masked) plus a link out to MailerLite, and the small local set
// of signups captured before MailerLite was connected (for the one-time import).
export default async function AdminSubscribersPage() {
  const { payload, user } = await authedPayload();
  // Subscriber emails are personal data — admin-only, same tier as the Team page.
  if (user.role !== "admin") redirect("/admin");

  const connected = isMailerLiteConfigured();
  const recent = connected
    ? await getRecentMailerLiteSubscribers({ limit: 25 })
    : { ok: false, status: "not_configured", subscribers: [], total: null, scoped: false };

  const recentMasked = recent.ok
    ? recent.subscribers.map((s) => ({
        id: s.id,
        emailMasked: maskEmail(s.email),
        firstName: s.name,
        status: s.status,
        ...dateFields(s.subscribedAt),
      }))
    : [];

  // The only subscriber data this app actually holds: signups captured locally
  // before MailerLite was connected. Small, bounded, meant to be drained.
  const { docs, totalDocs } = await payload.find({
    collection: "subscribers",
    sort: "-createdAt",
    limit: 0,
    depth: 0,
  });

  const localSignups = docs.map((d) => ({
    id: d.id,
    email: d.email,
    firstName: d.firstName || "",
    source: d.source || "",
    ...dateFields(d.createdAt),
  }));

  return (
    <SubscribersList
      mailerliteConnected={connected}
      recent={recentMasked}
      recentTotal={recent.total}
      recentScoped={recent.scoped}
      recentFailed={connected && !recent.ok}
      localSignups={localSignups}
      localTotal={totalDocs}
    />
  );
}
