"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";
import { IconInfo } from "@/components/icons/ds-icons";

import { MapVisit } from "@/components/home/map-visit";
import { useAdmin } from "@/lib/admin-store";
import { buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  defaultArticle,
  splitLines,
  splitParagraphs,
} from "@/lib/article-defaults";
import { cn } from "@/lib/utils";

type ArticleSection = {
  heading: string;
  lead: string;
  body: string;
  bullets: string;
  ordered?: boolean;
  cta: string;
  ctaHref?: string;
};
type Faq = { question: string; answer: string };
type Article = {
  heroLead: string;
  sections: ArticleSection[];
  faqLead: string;
  faqs: Faq[];
};
type Topic = {
  slug: string;
  title: string;
  description: string;
  article?: Article;
};
type Service = {
  slug: string;
  title: string;
  breadcrumb: string;
  topics: Topic[];
};

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

  // Analytics: `topic_viewed` (object-action, past tense) — the "information"
  // half of "services & information people visit most". See docs/ANALYTICS.md.
  const posthog = usePostHog();
  useEffect(() => {
    if (!service || !topic) return;
    posthog?.capture("topic_viewed", {
      service_slug: service.slug,
      service_name: service.title,
      topic_slug: topic.slug,
      topic_name: topic.title,
    });
  }, [service?.slug, topic?.slug, posthog]);

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

  const article: Article = topic.article ?? defaultArticle(topic);

  return (
    <>
      {/* Hero */}
      <section className="bg-bg-page">
        <div className="mx-auto max-w-[1680px] px-4 pb-8 pt-6 sm:px-6 lg:px-14 lg:pt-10">
          <nav
            aria-label="Breadcrumb"
            className="ds-section-x-padding pb-6 text-ds-xxs font-bold"
          >
            <Link href="/" className="text-primary hover:underline">
              Home
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <Link
              href={`/services/${service.slug}`}
              className="text-primary hover:underline"
            >
              {service.breadcrumb}
            </Link>
            <span className="mx-2 text-muted-foreground">/</span>
            <span className="text-foreground">{topic.title}</span>
          </nav>

          <div className="ds-section-padding rounded-none xl:rounded-[3.5rem]">
            <h1 className="font-heading text-ds-xxxxl font-bold text-primary">
              {topic.title}
            </h1>
            {article.heroLead ? (
              <p className="mt-6 max-w-2xl text-ds-l font-bold text-foreground">
                {article.heroLead}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Content sections */}
      <section className="bg-bg-page">
        <div className="mx-auto max-w-[1680px] space-y-8 px-4 pb-16 sm:px-6 lg:px-14">
          {article.sections.map((s, index) => {
            const paragraphs = splitParagraphs(s.body);
            const bullets = splitLines(s.bullets);
            const panel = index % 2 === 0;
            const ListTag = s.ordered ? "ol" : "ul";
            const listClass = s.ordered ? "list-decimal" : "list-disc";
            const ctaHref = s.ctaHref?.trim() || `/services/${service.slug}`;
            const ctaExternal = /^https?:/i.test(ctaHref);
            return (
              <article
                key={`${s.heading}-${index}`}
                className={cn(
                  "ds-section-padding rounded-none xl:rounded-[3.5rem]",
                  panel ? "bg-card" : "bg-bg-page"
                )}
              >
                <div className="mx-auto max-w-[760px]">
                  <header className="mb-6 flex items-center gap-4">
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-dark text-primary-foreground">
                      <IconInfo className="size-5" />
                    </div>
                    <h2 className="min-w-0 font-heading text-ds-xxxl font-bold text-brand-dark">
                      {s.heading}
                    </h2>
                  </header>

                  {s.lead ? (
                    <p className="max-w-3xl text-ds-m font-bold text-primary">
                      {s.lead}
                    </p>
                  ) : null}
                  {paragraphs.length || bullets.length ? (
                    <div className="mt-4 max-w-3xl space-y-3 text-ds-xs font-medium leading-relaxed text-brand-deep">
                      {paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                      {bullets.length ? (
                        <ListTag className={cn(listClass, "space-y-1 pl-6")}>
                          {bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ListTag>
                      ) : null}
                    </div>
                  ) : null}
                  {s.cta ? (
                    ctaExternal ? (
                      <a
                        href={ctaHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonVariants({ className: "mt-6 w-fit" })}
                      >
                        {s.cta}
                      </a>
                    ) : (
                      <Link
                        href={ctaHref}
                        className={buttonVariants({ className: "mt-6 w-fit" })}
                      >
                        {s.cta}
                      </Link>
                    )
                  ) : null}
                </div>
              </article>
            );
          })}

          {article.faqs.length ? (
            <section className="ds-section-padding-compact rounded-none xl:rounded-[3.5rem]">
              <div className="mx-auto max-w-[760px]">
                <header className="mb-6 flex items-center gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-dark text-primary-foreground">
                    <IconInfo className="size-5" />
                  </div>
                  <h2 className="min-w-0 font-heading text-ds-xxxl font-bold text-brand-dark">
                    Frequently Asked Questions
                  </h2>
                </header>
                {article.faqLead ? (
                  <p className="text-ds-m font-bold text-primary">
                    {article.faqLead}
                  </p>
                ) : null}
                <Accordion
                  defaultValue={[article.faqs[0].question]}
                  className="mt-6"
                >
                  {article.faqs.map((faq, i) => (
                    <AccordionItem key={`${faq.question}-${i}`} value={faq.question}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </section>
          ) : null}
        </div>
      </section>

      <MapVisit />
    </>
  );
}
