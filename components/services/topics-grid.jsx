import Link from "next/link";
import {
  IconArrowDown,
  IconArrowRight,
  IconInfo,
  IconNotes,
} from "@/components/icons/ds-icons";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TopicsGrid({ topics, categorySlug }) {
  return (
    <section id="topics" className="scroll-mt-20 bg-bg-page">
      <div className="mx-auto max-w-[1680px] px-4 pb-16 sm:px-6 lg:px-14">
        <div className="ds-section-padding rounded-none xl:rounded-[3.5rem] bg-card">
          <header className="mb-10 flex items-center gap-4">
            <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-dark text-primary-foreground">
              <IconInfo className="size-5" />
            </div>
            <h2 className="min-w-0 font-heading text-ds-xxxl font-bold text-brand-dark">
              Articles
            </h2>
          </header>

          {topics.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="grid size-14 place-items-center rounded-2xl bg-secondary text-primary">
                <IconNotes className="size-6" />
              </div>
              <div className="max-w-md">
                <h3 className="font-heading text-ds-xl font-bold text-brand-dark">
                  Guides are coming soon
                </h3>
                <p className="mt-2 text-ds-s font-medium text-muted-foreground">
                  We&apos;re still preparing articles for this service. In the
                  meantime, the contacts below can help you directly.
                </p>
              </div>
              <Link
                href="#contacts"
                className={buttonVariants({ variant: "secondary" })}
              >
                See contacts
                <IconArrowDown className="size-4" />
              </Link>
            </div>
          ) : (
            <div
              className={cn(
                "grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4",
                // A lone card would otherwise stretch across the full row
                // (2–3 cards wide). Cap it to a middle-ground width so it reads
                // as a card, not a banner.
                topics.length === 1 && "max-w-[460px]"
              )}
            >
              {topics.map((topic) => (
                <div
                  key={topic.slug}
                  className="flex flex-col rounded-lg border-2 border-border bg-card p-6"
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
                    <IconArrowRight className="size-4" />
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
