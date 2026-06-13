import Link from "next/link";
import { ChevronRight, Info } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function TopicsGrid({ topics, categorySlug }) {
  return (
    <section id="topics" className="scroll-mt-20 bg-bg-page">
      <div className="mx-auto max-w-[1680px] px-4 pb-16 sm:px-6 lg:px-14">
        <div className="ds-section-padding rounded-none xl:rounded-[3.5rem] bg-card">
          <header className="mb-10 flex items-center gap-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-dark text-primary-foreground">
              <Info className="size-5" strokeWidth={1.9} />
            </div>
            <h2 className="min-w-0 font-heading text-ds-xxxl font-bold text-brand-dark">
              Articles
            </h2>
          </header>

          {topics.length === 0 ? (
            <p className="text-ds-s text-muted-foreground">
              Articles for this category will appear here.
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
              {topics.map((topic) => (
                <div
                  key={topic.slug}
                  className="flex flex-col rounded-3xl border-2 border-border bg-card p-6"
                >
                  <h3 className="font-heading text-ds-l font-bold text-foreground">
                    {topic.title}
                  </h3>
                  <p className="mt-2 line-clamp-5 flex-1 text-ds-s font-medium text-foreground">
                    {topic.description}
                  </p>
                  <Link
                    href={`/services/${categorySlug}/${topic.slug}`}
                    className={buttonVariants({ className: "mt-5 w-fit" })}
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
