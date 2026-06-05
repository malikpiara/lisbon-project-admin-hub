import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function TopicsGrid({ topics, categorySlug }) {
  return (
    <section id="topics" className="scroll-mt-20 bg-bg-page">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-14">
        <div className="rounded-3xl bg-card p-6 ring-1 ring-foreground/5 sm:p-10">
          <header className="mb-8 flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-dark text-primary-foreground">
              <Info className="size-5" />
            </div>
            <h2 className="font-heading text-ds-xxl font-medium tracking-tight text-primary">
              Articles
            </h2>
          </header>

          {topics.length === 0 ? (
            <p className="text-ds-s text-muted-foreground">
              Articles for this category will appear here.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <div
                  key={topic.slug}
                  className="flex flex-col rounded-xl border border-border bg-card p-6"
                >
                  <h3 className="font-heading text-ds-l font-medium text-foreground">
                    {topic.title}
                  </h3>
                  <p className="mt-2 line-clamp-4 flex-1 text-ds-xs text-muted-foreground">
                    {topic.description}
                  </p>
                  <Link
                    href={`/services/${categorySlug}/${topic.slug}`}
                    className={buttonVariants({ className: "mt-5 h-11 w-fit px-4" })}
                  >
                    Read Article
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
