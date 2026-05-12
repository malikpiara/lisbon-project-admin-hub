import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const schedule = [
  { day: "Mon - Tue - Thu", hours: "10:00–13:00 / 14:00–18:00" },
  { day: "Wednesday (Extended)", hours: "Until 19:30" },
  { day: "Friday", hours: "Until 18:30" },
];

export function SupportHours() {
  return (
    <section className="bg-bg-mint">
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Support Hours
            </h2>
            <p className="mt-4 max-w-md text-base text-foreground">
              In need of administrative or emotional support? Visit us in
              person.
            </p>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Our team provides in-person support to help you navigate systems
              and connect with internal and external services.
            </p>
            <Link
              href="/contact"
              className={buttonVariants({
                size: "lg",
                className: "mt-6 h-11 rounded-full px-7 text-sm",
              })}
            >
              Get Support Now
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </div>

          <Card className="rounded-3xl border-2 border-primary/40 bg-white p-8 shadow-md">
            <div className="flex items-center gap-2">
              <Clock className="size-6 text-primary" />
              <h3 className="text-2xl font-semibold text-foreground">
                Opening Hours
              </h3>
            </div>
            <dl className="mt-6 divide-y divide-primary/15">
              {schedule.map((row) => (
                <div
                  key={row.day}
                  className="flex items-center justify-between gap-4 py-4 text-sm"
                >
                  <dt className="font-semibold text-foreground">{row.day}</dt>
                  <dd className="text-muted-foreground">{row.hours}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex items-center gap-2 rounded-xl border border-primary/30 bg-accent/60 px-4 py-3 text-sm text-foreground">
              <Sparkles className="size-4 text-brand-yellow" />
              <span>No appointment needed. Just walk in.</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
