"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import Link from "next/link";
import { IconInfo } from "@/components/icons/ds-icons";

import { getServiceIcon, getServiceIconKey } from "@/lib/service-icons";
import { KeyLinks, type KeyLink } from "@/components/services/key-links";
import {
  ReferenceTable,
  type ReferenceTableData,
} from "@/components/services/reference-table";
import { renderInline } from "@/components/services/inline-links";
import { MapVisit } from "@/components/home/map-visit";
import { buttonVariants } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { splitParagraphs } from "@/lib/article-defaults";
import { cn } from "@/lib/utils";

const EMPTY_ARTICLE: Article = {
  heroLead: "",
  sections: [],
  keyLinks: [],
  faqLead: "",
  faqs: [],
};

type ContentBlock =
  | { type: "text"; body: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "table"; title: string; rows: ReferenceTableData["rows"] }
  | { type: "button"; label: string; href: string };
type ArticleSection = {
  heading: string;
  lead: string;
  blocks: ContentBlock[];
};
type Faq = { question: string; answer: string };
type Article = {
  heroLead: string;
  sections: ArticleSection[];
  keyLinks?: KeyLink[];
  faqLead: string;
  faqs: Faq[];
};
type Topic = {
  slug: string;
  title: string;
  description: string;
  article?: Article | null;
};
type ServiceMeta = {
  slug: string;
  title: string;
  iconKey?: string;
};

// Presentational: the route fetches the article from Payload and passes it in
// (a missing slug/topic 404s server-side via notFound()). Client only for the
// analytics capture.
export function ArticleView({
  service,
  topic,
}: {
  service: ServiceMeta;
  topic: Topic;
}) {
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

  if (!service || !topic) return null;

  const article: Article = topic.article ?? EMPTY_ARTICLE;
  // Per the article spec (Proposal 949:4028), content-section chips carry the
  // service's category glyph — the same one as its home tile — while the FAQ
  // section keeps the generic info icon.
  const CategoryIcon = getServiceIcon(
    getServiceIconKey(service.slug, service.iconKey)
  );

  return (
    <>
      {/* Hero */}
      <section className="bg-bg-page">
        <div className="mx-auto max-w-[1680px] px-4 pb-8 pt-6 sm:px-6 lg:px-14 lg:pt-10">
          <Breadcrumb className="ds-section-x-padding pb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/services/${service.slug}`}>
                  {service.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{topic.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

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
          {/* Key links lead the article ("I just need the portal link") —
              decided 2026-07-04, matching the old site's hierarchy. */}
          <KeyLinks links={article.keyLinks ?? []} />

          {article.sections.map((s, index) => {
            const panel = index % 2 === 0;
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
                      <CategoryIcon className="size-5" />
                    </div>
                    <h2 className="min-w-0 font-heading text-ds-xxxl font-bold text-brand-dark">
                      {s.heading}
                    </h2>
                  </header>

                  {s.lead ? (
                    <p className="max-w-3xl text-ds-m font-bold text-primary">
                      {renderInline(s.lead, `lead-${index}`)}
                    </p>
                  ) : null}
                  {s.blocks.length ? (
                    <div className="mt-4 max-w-3xl space-y-4">
                      {s.blocks.map((b, i) => {
                        const k = `${index}-${i}`;
                        if (b.type === "text") {
                          const ps = splitParagraphs(b.body);
                          return ps.length ? (
                            <div
                              key={i}
                              className="space-y-3 text-ds-xs font-medium leading-relaxed text-brand-deep"
                            >
                              {ps.map((p, j) => (
                                <p key={j}>{renderInline(p, `t-${k}-${j}`)}</p>
                              ))}
                            </div>
                          ) : null;
                        }
                        if (b.type === "list") {
                          const ListTag = b.ordered ? "ol" : "ul";
                          const listClass = b.ordered
                            ? "list-decimal"
                            : "list-disc";
                          return b.items.length ? (
                            <ListTag
                              key={i}
                              className={cn(
                                listClass,
                                "space-y-1 pl-6 text-ds-xs font-medium leading-relaxed text-brand-deep"
                              )}
                            >
                              {b.items.map((it, j) => (
                                <li key={j}>{renderInline(it, `l-${k}-${j}`)}</li>
                              ))}
                            </ListTag>
                          ) : null;
                        }
                        if (b.type === "table") {
                          return b.rows.length ? (
                            <ReferenceTable
                              key={i}
                              title={b.title}
                              rows={b.rows}
                            />
                          ) : null;
                        }
                        if (b.type === "button" && b.label.trim()) {
                          const href =
                            b.href?.trim() || `/services/${service.slug}`;
                          const external = /^https?:/i.test(href);
                          return (
                            <div key={i}>
                              {external ? (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={buttonVariants({ className: "w-fit" })}
                                >
                                  {b.label}
                                </a>
                              ) : (
                                <Link
                                  href={href}
                                  className={buttonVariants({ className: "w-fit" })}
                                >
                                  {b.label}
                                </Link>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
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
                      <AccordionContent>
                        {renderInline(faq.answer, `faq-${i}`)}
                      </AccordionContent>
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
