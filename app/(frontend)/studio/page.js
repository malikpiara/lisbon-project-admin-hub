import Link from "next/link";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { ArrowRight, BarChart3, FileText, ListChecks, Sparkles } from "lucide-react";

import { Card } from "@/components/ui/card";

export const metadata = {
  title: "Studio · Lisbon Project",
};

export default async function StudioDashboard() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user) {
    redirect("/cms-admin/login");
  }

  const [quickAccess, services, topics] = await Promise.all([
    payload.find({ collection: "quick-access", limit: 0, depth: 0 }),
    payload.find({ collection: "services", limit: 0, depth: 0 }),
    payload.find({ collection: "topics", limit: 0, depth: 0 }),
  ]);

  const cards = [
    {
      href: "/studio/quick-access",
      icon: Sparkles,
      label: "Quick Access",
      count: quickAccess.totalDocs,
      noun: "cards",
      hint: "Link cards in the home hero.",
    },
    {
      href: "/studio/services",
      icon: ListChecks,
      label: "Services & Information",
      count: services.totalDocs,
      noun: "categories",
      hint: "Categories on the home grid.",
    },
    {
      href: "/studio/topics",
      icon: FileText,
      label: "Topics",
      count: topics.totalDocs,
      noun: "articles",
      hint: "Articles across all categories.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header>
        <h1 className="font-heading text-ds-xxl font-bold text-foreground">
          Content studio
        </h1>
        <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
          Payload-backed editor · saved to Postgres · signed in as {user.email}
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <div className="flex items-start gap-4 px-4 xl:px-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <Icon className="size-5" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-heading text-ds-s font-bold text-foreground">
                      {c.label}
                    </h2>
                    <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
                      {c.hint}
                    </p>
                    <p className="mt-3 text-ds-xxs font-bold text-primary">
                      {c.count} {c.noun}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                </div>
              </Card>
            </Link>
          );
        })}

        <Link
          href="/insights"
          className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <Card className="h-full transition-shadow group-hover:shadow-md">
            <div className="flex items-start gap-4 px-4 xl:px-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <BarChart3 className="size-5" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-heading text-ds-s font-bold text-foreground">
                  Insights
                </h2>
                <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
                  What visitors view and search for.
                </p>
                <p className="mt-3 text-ds-xxs font-bold text-primary">
                  Team analytics
                </p>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
