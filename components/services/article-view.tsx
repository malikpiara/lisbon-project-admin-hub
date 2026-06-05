"use client";

import Link from "next/link";
import { Info } from "lucide-react";

import { MapVisit } from "@/components/home/map-visit";
import { useAdmin } from "@/lib/admin-store";

const HERO_SUBHEAD =
  "Connecting community members to external services and internal resources.";

type Topic = { slug: string; title: string; description: string };
type Service = { slug: string; title: string; breadcrumb: string; topics: Topic[] };

// Articles have no body in the mock data yet; render the DS's titled-section
// structure with placeholder content (the lead reuses the topic's description).
function articleSections(topic: Topic) {
  return [
    {
      heading: "What is it?",
      lead: topic.description,
      paragraphs: [
        "Lorem ipsum dolor sit amet consectetur. Risus id posuere ornare proin gravida egestas dictumst diam. However, prior to the mandatory entrance, after turning 3, members can enter the relevant process, which is organized into different stages:",
      ],
      bullets: [
        "an initial registration step, where eligibility is confirmed;",
        "a documentation step, gathering the required paperwork;",
        "a submission step, where the application is reviewed;",
        "a follow-up step, to track the status of the request.",
      ],
      after: [
        "Those who have completed the process can continue accessing related services and support.",
        "Anyone can begin the process — neither residence permits nor prior registration are required to get started.",
      ],
    },
    {
      heading: "Why would I need it?",
      lead: "Access to this service helps community members navigate the relevant administrative processes with confidence.",
      paragraphs: [
        "Lorem ipsum dolor sit amet consectetur. Risus id posuere ornare proin gravida egestas dictumst diam. Lorem ipsum dolor sit amet consectetur.",
        "Risus id posuere ornare proin gravida egestas dictumst diam. Lorem ipsum dolor sit amet consectetur adipiscing elit.",
      ],
      bullets: [] as string[],
      after: [] as string[],
    },
    {
      heading: "How do I get it?",
      lead: "Follow these steps to access the service and get the support you need.",
      paragraphs: [
        "Lorem ipsum dolor sit amet consectetur. Risus id posuere ornare proin gravida egestas dictumst diam. Reach out via the contacts listed on the category page, or visit us in person during opening hours.",
      ],
      bullets: [] as string[],
      after: [] as string[],
    },
  ];
}

export function ArticleView({
  slug,
  topicSlug,
}: {
  slug: string;
  topicSlug: string;
}) {
  const { data, hydrated } = useAdmin() as {
    data: { services: Service[] };
    hydrated: boolean;
  };
  const service = data.services.find((s) => s.slug === slug);
  const topic = service?.topics.find((t) => t.slug === topicSlug);

  if (!service || !topic) {
    if (!hydrated) return null;
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-heading text-ds-xxl font-medium text-foreground">
          Article not found
        </h1>
        <Link
          href="/"
          className="mt-6 inline-block text-ds-s font-medium text-primary hover:underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const sections = articleSections(topic);

  return (
    <>
      {/* Hero */}
      <section className="bg-bg-page">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-14 lg:pb-16">
          <nav aria-label="Breadcrumb" className="mb-10 text-ds-xs">
            <Link href="/" className="text-primary hover:underline">
              Home
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link href={`/services/${service.slug}`} className="text-primary hover:underline">
              {service.breadcrumb}
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground">{topic.title}</span>
          </nav>

          <h1 className="font-heading text-ds-xxxxl font-medium tracking-tight text-primary">
            {topic.title}
          </h1>
          <p className="mt-6 max-w-2xl text-ds-xl font-semibold text-foreground">
            {HERO_SUBHEAD}
          </p>
        </div>
      </section>

      {/* Content sections */}
      <section className="bg-bg-page">
        <div className="mx-auto max-w-7xl space-y-8 px-4 pb-16 sm:px-6 lg:px-14">
          {sections.map((s) => (
            <article
              key={s.heading}
              className="rounded-3xl bg-card p-6 ring-1 ring-foreground/5 sm:p-10"
            >
              <header className="mb-5 flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-dark text-primary-foreground">
                  <Info className="size-5" />
                </div>
                <h2 className="font-heading text-ds-xxl font-medium tracking-tight text-primary">
                  {s.heading}
                </h2>
              </header>

              <p className="max-w-3xl text-ds-m font-semibold text-primary">
                {s.lead}
              </p>
              <div className="mt-4 max-w-3xl space-y-3 text-ds-s text-foreground">
                {s.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {s.bullets.length ? (
                  <ul className="list-disc space-y-1 pl-6">
                    {s.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}
                {s.after.map((p, i) => (
                  <p key={`a-${i}`}>{p}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <MapVisit />
    </>
  );
}
