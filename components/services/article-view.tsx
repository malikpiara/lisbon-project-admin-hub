"use client";

import Link from "next/link";
import { Info } from "lucide-react";

import { MapVisit } from "@/components/home/map-visit";
import { useAdmin } from "@/lib/admin-store";
import { buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

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
        "Anyone can begin the process. Residence permits or prior registration are not required to get started.",
      ],
      panel: true,
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
      panel: false,
    },
    {
      heading: "Step-by-Step guide",
      lead: "Follow these steps to access the service and get the support you need.",
      paragraphs: [],
      bullets: [
        "Review the requirements and confirm which organization is responsible for your request.",
        "Collect identification, proof of address, and any supporting documents listed below.",
        "Contact the service provider or visit during opening hours to start the process.",
        "Keep copies of submitted documents and note any reference numbers or follow-up dates.",
      ],
      after: [] as string[],
      panel: true,
    },
    {
      heading: "Documents Required",
      lead: "Bring the documents that prove identity, residence, and eligibility for this process.",
      paragraphs: [
        "Requirements vary by organization, so confirm the list before your appointment or visit.",
      ],
      bullets: [
        "Identification document or passport",
        "Proof of address in Portugal",
        "Relevant certificates, forms, or previous case documents",
      ],
      after: [] as string[],
      panel: false,
    },
    {
      heading: "Community Tips and Learning",
      lead: "A few practical notes can make the process easier to complete.",
      paragraphs: [
        "Arrive early when visiting public offices, keep digital and paper copies of key documents, and ask for written confirmation when a request is submitted.",
      ],
      bullets: [
        "Take a translator or trusted support person if language may be a barrier.",
        "Save phone numbers and email addresses for follow-up.",
        "Check whether appointments are required before travelling.",
      ],
      after: [] as string[],
      panel: true,
    },
  ];
}

const faqs = [
  {
    question: "How do I register my child for public education?",
    answer:
      "In order to register, you need a valid LP profile in MyLP — you can create one in a few minutes. Registration is not first-come-first-served: it does not matter when you apply, as long as you do it within the required period. Our placement criteria help us prioritise families in more vulnerable situations.",
  },
  {
    question: "What family benefits am I entitled to?",
    answer:
      "Depending on your income and household, you may be eligible for childcare subsidies, school meal support, and family allowances. Contact us or visit during opening hours and we'll help you identify which benefits apply to your situation.",
  },
];

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
        <div className="mx-auto max-w-[1680px] px-4 pb-8 pt-6 sm:px-6 lg:px-14 lg:pt-10">
          <nav
            aria-label="Breadcrumb"
            className="ds-section-x-padding pb-6 text-ds-xxs font-bold"
          >
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

          <div className="ds-section-padding rounded-none xl:rounded-[3.5rem]">
            <h1 className="font-heading text-ds-xxxxl font-bold text-primary">
              {topic.title}
            </h1>
            <p className="mt-6 max-w-2xl text-ds-l font-bold text-foreground">
              {HERO_SUBHEAD}
            </p>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <section className="bg-bg-page">
        <div className="mx-auto max-w-[1680px] space-y-8 px-4 pb-16 sm:px-6 lg:px-14">
          {sections.map((s, index) => (
            <article
              key={s.heading}
              className={cn(
                "ds-section-padding rounded-none xl:rounded-[3.5rem]",
                s.panel ? "bg-card" : "bg-bg-page"
              )}
            >
              <div className="mx-auto max-w-[760px]">
                <header className="mb-6 flex items-center gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-dark text-primary-foreground">
                    <Info className="size-5" strokeWidth={1.9} />
                  </div>
                  <h2 className="min-w-0 font-heading text-ds-xxxl font-bold text-brand-dark">
                    {s.heading}
                  </h2>
                </header>

                <p className="max-w-3xl text-ds-m font-bold text-primary">
                  {s.lead}
                </p>
                <div className="mt-4 max-w-3xl space-y-3 text-ds-xs font-medium leading-relaxed text-brand-deep">
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
                {index === 1 ? (
                  <Link
                    href={`/services/${service.slug}`}
                    className={buttonVariants({ className: "mt-6 w-fit" })}
                  >
                    Get Support Now
                  </Link>
                ) : null}
              </div>
            </article>
          ))}

          <section className="ds-section-padding-compact rounded-none xl:rounded-[3.5rem]">
            <div className="mx-auto max-w-[760px]">
              <header className="mb-6 flex items-center gap-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-dark text-primary-foreground">
                  <Info className="size-5" strokeWidth={1.9} />
                </div>
                <h2 className="min-w-0 font-heading text-ds-xxxl font-bold text-brand-dark">
                  Frequently Asked Questions
                </h2>
              </header>
              <p className="text-ds-m font-bold text-primary">
                Find answers to common questions about family and childcare services.
              </p>
              <Accordion defaultValue={[faqs[0].question]} className="mt-6">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.question} value={faq.question}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        </div>
      </section>

      <MapVisit />
    </>
  );
}
