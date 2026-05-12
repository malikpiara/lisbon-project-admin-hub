import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const toneStyles = {
  rose: { border: "border-l-rose-400", iconBg: "bg-rose-100" },
  teal: { border: "border-l-teal-400", iconBg: "bg-teal-100" },
  violet: { border: "border-l-violet-400", iconBg: "bg-violet-100" },
  pink: { border: "border-l-pink-400", iconBg: "bg-pink-100" },
  emerald: { border: "border-l-emerald-400", iconBg: "bg-emerald-100" },
  cyan: { border: "border-l-cyan-400", iconBg: "bg-cyan-100" },
  orange: { border: "border-l-orange-400", iconBg: "bg-orange-100" },
  blue: { border: "border-l-blue-400", iconBg: "bg-blue-100" },
};

export function TopicsGrid({ topics, categorySlug }) {
  return (
    <section id="topics" className="scroll-mt-20 bg-bg-mint">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Topics
        </h2>

        {topics.length === 0 ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Topics for this category will appear here.
          </p>
        ) : (
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {topics.map((topic) => {
              const tone = toneStyles[topic.tone] ?? toneStyles.teal;
              return (
                <Link
                  key={topic.slug}
                  href={`/services/${categorySlug}/${topic.slug}`}
                  className="group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Card
                    className={`flex-row items-start gap-4 border-l-4 ${tone.border} bg-card p-5 transition-shadow group-hover:shadow-md`}
                  >
                    <div
                      className={`size-11 shrink-0 rounded-lg ${tone.iconBg}`}
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold leading-snug text-foreground">
                        {topic.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {topic.description}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
