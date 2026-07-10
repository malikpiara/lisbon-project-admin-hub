import Link from "next/link";
// DS lacks these (Insights=chart, Contacts, History, Services=list, Quick Access) —
// kept on lucide, flagged for Rafael.
import { BarChart3, Contact, History, ListChecks, Sparkles } from "lucide-react";
import {
  IconArrowRight,
  IconChatBot,
  IconNotes,
  IconUsers,
} from "@/components/icons/ds-icons";

import { Card } from "@/components/ui/card";
import { authedPayload } from "@/lib/admin-auth";

export const metadata = {
  // `absolute` bypasses the root brand template. The admin layout's passthrough
  // template ("%s") only applies to DEEPER segments, not this index page, so
  // without absolute the root "%s · The Lisbon Project" would double-brand it.
  title: { absolute: "Admin Hub" },
};

// One card per destination. Grouped to mirror the sidebar (Content / Analytics /
// Admin) so the dashboard and the nav share one mental model — the same
// vocabulary, the same order. `meta` is a short status line (a count, or what
// the section is for); it stays quiet when there's nothing useful to say.
function DashCard({ href, icon: Icon, label, hint, meta }) {
  return (
    <Link
      href={href}
      className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
    >
      <Card className="h-full transition-shadow group-hover:shadow-md">
        <div className="flex items-start gap-4 px-4 xl:px-6">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
            <Icon className="size-5" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-ds-s font-bold text-foreground">
              {label}
            </h3>
            <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
              {hint}
            </p>
            {meta ? (
              <p className="mt-3 text-ds-xxs font-bold text-primary">{meta}</p>
            ) : null}
          </div>
          <IconArrowRight className="mt-1 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
        </div>
      </Card>
    </Link>
  );
}

export default async function AdminDashboard() {
  const { payload, user } = await authedPayload();
  const isAdmin = user.role === "admin";

  // We only need the counts here. `limit: 0` tells Payload to return *every*
  // row (it would fetch all 141 topics just to show "141"); `limit: 1` returns
  // the same `totalDocs` while fetching a single row. Run them in parallel.
  const [quickAccess, services, topics, contacts, activity, team] =
    await Promise.all([
      payload.find({ collection: "quick-access", limit: 1, depth: 0 }),
      payload.find({ collection: "services", limit: 1, depth: 0 }),
      payload.find({ collection: "topics", limit: 1, depth: 0 }),
      payload.find({ collection: "contacts", limit: 1, depth: 0 }),
      payload.find({ collection: "audit-log", limit: 1, depth: 0 }),
      isAdmin
        ? payload.find({ collection: "users", limit: 1, depth: 0 })
        : Promise.resolve(null),
    ]);

  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

  const groups = [
    {
      title: "Content",
      hint: "Everything the public site shows.",
      cards: [
        {
          href: "/admin/quick-access",
          icon: Sparkles,
          label: "Quick Access",
          hint: "Link cards in the home hero.",
          meta: plural(quickAccess.totalDocs, "card", "cards"),
        },
        {
          href: "/admin/services",
          icon: ListChecks,
          label: "Services & Information",
          hint: "Categories on the home grid.",
          meta: plural(services.totalDocs, "category", "categories"),
        },
        {
          href: "/admin/articles",
          icon: IconNotes,
          label: "Articles",
          hint: "Articles across all categories.",
          meta: plural(topics.totalDocs, "article", "articles"),
        },
        {
          href: "/admin/contacts",
          icon: Contact,
          label: "Contacts",
          hint: "The directory behind every contacts table.",
          meta: plural(contacts.totalDocs, "contact", "contacts"),
        },
      ],
    },
    {
      title: "Analytics",
      hint: "What visitors do, and what the team changes.",
      cards: [
        {
          href: "/admin/insights",
          icon: BarChart3,
          label: "Insights",
          hint: "What visitors view and search for.",
          meta: "Team analytics",
        },
        {
          href: "/admin/conversations",
          icon: IconChatBot,
          label: "Conversations",
          hint: "What people ask the help chatbot.",
          meta: "Personal details hidden",
        },
        {
          href: "/admin/history",
          icon: History,
          label: "History",
          hint: "Every change — who, what, and when.",
          meta:
            activity.totalDocs > 0
              ? plural(activity.totalDocs, "entry", "entries")
              : "Activity log",
        },
      ],
    },
  ];

  if (isAdmin) {
    groups.push({
      title: "Admin",
      hint: "Manage who can sign in.",
      cards: [
        {
          href: "/admin/users",
          icon: IconUsers,
          label: "Team",
          hint: "People who can sign in and edit.",
          meta: team ? plural(team.totalDocs, "person", "people") : "Manage team",
        },
      ],
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-8 pt-12 pb-28">
      <header>
        <h1 className="font-heading text-ds-xxl font-bold text-foreground">
          Admin Hub
        </h1>
        <p className="mt-2 max-w-2xl text-ds-xs font-medium leading-relaxed text-muted-foreground">
          Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""} — manage
          everything the public site shows, and see how it's used.
        </p>
      </header>

      {/* No entry animation on the cards — admins land here many times a day,
          and a stagger they've seen a hundred times reads as friction, not
          delight (per the animation guidance: don't animate the frequent). */}
      <div className="mt-10 space-y-10">
        {groups.map((group) => (
          <section key={group.title}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground">
                {group.title}
              </h2>
              <p className="text-ds-xxs font-medium text-muted-foreground">
                {group.hint}
              </p>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {group.cards.map((c) => (
                <DashCard key={c.href} {...c} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
