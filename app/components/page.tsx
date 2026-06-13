import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { COMPONENT_DOCS, STYLEGUIDE_NAV_GROUPS } from "./_components/styleguide-docs";

export default function StyleguideIndexPage() {
  return (
    <div className="space-y-12">
      <header className="max-w-4xl space-y-4">
        <Badge variant="outline">Living style guide</Badge>
        <h1 className="font-heading text-ds-xxxxl font-bold text-foreground">
          Lisbon Project component library
        </h1>
        <p className="text-ds-l font-medium text-muted-foreground">
          A focused reference for building new pages and checking whether
          existing surfaces still match the design system.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {STYLEGUIDE_NAV_GROUPS.map((group) => (
          <Card key={group.title} className="py-0">
            <CardContent className="p-6">
              <p className="font-heading text-ds-l font-bold text-foreground">
                {group.title}
              </p>
              <p className="mt-2 text-ds-xs font-medium text-muted-foreground">
                {group.items.length} reference pages
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-5">
        <h2 className="font-heading text-ds-xxl font-bold text-foreground">
          Components
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {COMPONENT_DOCS.map((doc) => (
            <Link key={doc.slug} href={`/components/${doc.slug}`} className="group">
              <Card className="h-full py-0 transition-shadow group-hover:shadow-[0_18px_36px_rgba(7,24,23,0.08)]">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge variant="outline">{doc.category}</Badge>
                      <h3 className="mt-4 font-heading text-ds-l font-bold text-foreground">
                        {doc.title}
                      </h3>
                    </div>
                    <ArrowRight className="mt-1 size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-3 flex-1 text-ds-xs font-medium text-muted-foreground">
                    {doc.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
