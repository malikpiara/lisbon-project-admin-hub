import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function CategoryQuickAccess({ categoryLabel = "this category" }) {
  const items = [
    {
      title: "Topics",
      description: `View all topics associated with ${categoryLabel}`,
      href: "#topics",
    },
    {
      title: "Contacts",
      description: `Key contact information for ${categoryLabel} services`,
      href: "#contacts",
    },
    {
      title: "FAQs",
      description: `View the most commonly asked questions related to ${categoryLabel}`,
      href: "#faqs",
    },
  ];

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Badge
          variant="secondary"
          className="rounded-full bg-accent px-3 py-1 text-xs font-medium uppercase tracking-wider text-accent-foreground"
        >
          Quick Access
        </Badge>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card
              key={item.title}
              className="border-border/60 transition-shadow hover:shadow-md"
            >
              <CardContent className="flex h-full flex-col gap-4 p-5">
                <div
                  aria-hidden
                  className="size-14 shrink-0 rounded-xl bg-brand-yellow"
                />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <a
                  href={item.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Learn more
                  <ArrowRight className="size-3.5" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
