"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ExternalLink,
  FileText,
  HelpCircle,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field } from "@/components/admin/field";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  EditorRow,
  EditorSkeleton,
  EmptyState,
  Section,
} from "@/components/admin/editor-ui";
import { defaultArticle } from "@/lib/article-defaults";
import { useAdmin } from "@/lib/admin-store";

export default function TopicEditorPage({ params }) {
  const { slug, topic: topicSlug } = use(params);
  const { data, hydrated, updateTopic, removeTopic, setTopicArticle } =
    useAdmin();

  const service = data.services.find((s) => s.slug === slug);
  const topic = service?.topics.find((t) => t.slug === topicSlug);

  if (!hydrated) return <EditorSkeleton />;
  if (!service || !topic) notFound();

  const article = topic.article ?? defaultArticle(topic);

  // Every edit writes the whole article back (materialising the default on first
  // change). Keeps the store API tiny; the immutable plumbing lives here.
  const writeArticle = (patch) =>
    setTopicArticle(slug, topicSlug, { ...article, ...patch });
  const writeSection = (i, patch) =>
    writeArticle({
      sections: article.sections.map((s, idx) =>
        idx === i ? { ...s, ...patch } : s
      ),
    });
  const addSection = () =>
    writeArticle({
      sections: [
        ...article.sections,
        { heading: "New section", lead: "", body: "", bullets: "", cta: "" },
      ],
    });
  const removeSection = (i) =>
    writeArticle({ sections: article.sections.filter((_, idx) => idx !== i) });
  const writeFaq = (i, patch) =>
    writeArticle({
      faqs: article.faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    });
  const addFaq = () =>
    writeArticle({
      faqs: [...article.faqs, { question: "New question", answer: "" }],
    });
  const removeFaq = (i) =>
    writeArticle({ faqs: article.faqs.filter((_, idx) => idx !== i) });

  return (
    <div>
      <div className="sticky top-0 z-10 border-b-2 border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-8 py-4">
          <nav className="text-ds-xxs font-medium text-muted-foreground">
            <Link href="/admin/services" className="hover:text-foreground">
              Services
            </Link>
            <span className="mx-1.5">/</span>
            <Link
              href={`/admin/services/${service.slug}`}
              className="hover:text-foreground"
            >
              {service.title}
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-foreground">{topic.title}</span>
          </nav>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <FileText className="size-5" strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <h1 className="truncate font-heading text-ds-xl font-bold text-foreground">
                  {topic.title || "Untitled topic"}
                </h1>
                <p className="truncate font-mono text-ds-xxs text-muted-foreground">
                  /services/{service.slug}/{topic.slug}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/services/${service.slug}/${topic.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                View on site
                <ExternalLink className="size-3.5" />
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setTopicArticle(slug, topicSlug, defaultArticle(topic))
                }
              >
                <RotateCcw />
                Reset article
              </Button>
              <DeleteButton
                onConfirm={() => {
                  removeTopic(slug, topicSlug);
                  window.location.href = `/admin/services/${service.slug}`;
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-10">
        {/* Basics */}
        <Section
          title="Basics"
          description="The title, colour, and summary shown on the category page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Title"
              value={topic.title}
              onChange={(v) => updateTopic(slug, topicSlug, { title: v })}
            />
            <Field
              className="sm:col-span-2"
              label="Description"
              hint="Shown on the category card and reused as the intro line."
              value={topic.description}
              onChange={(v) => updateTopic(slug, topicSlug, { description: v })}
              textarea
              rows={2}
            />
            <Field
              className="sm:col-span-2"
              label="Hero subheading"
              hint="The bold line under the title at the top of the article."
              value={article.heroLead}
              onChange={(v) => writeArticle({ heroLead: v })}
            />
          </div>
        </Section>

        {/* Article sections */}
        <Section
          title="Article sections"
          count={article.sections.length}
          action={
            <Button size="sm" onClick={addSection}>
              <Plus className="size-3.5" />
              Add section
            </Button>
          }
        >
          {article.sections.length === 0 ? (
            <EmptyState
              icon={FileText}
              label="No sections yet"
              hint="Sections become the titled content blocks on the article page."
            />
          ) : (
            <div className="space-y-2">
              {article.sections.map((s, i) => (
                <EditorRow
                  key={i}
                  title={s.heading || "Untitled section"}
                  subtitle={s.lead}
                  defaultOpen={s.heading === "New section"}
                  onDelete={() => removeSection(i)}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Heading"
                      value={s.heading}
                      onChange={(v) => writeSection(i, { heading: v })}
                    />
                    <Field
                      label="Lead"
                      hint="Teal intro line above the body."
                      value={s.lead}
                      onChange={(v) => writeSection(i, { lead: v })}
                    />
                    <Field
                      className="sm:col-span-2"
                      label="Body"
                      hint="Paragraphs — separate them with a blank line."
                      value={s.body}
                      onChange={(v) => writeSection(i, { body: v })}
                      textarea
                      rows={4}
                    />
                    <Field
                      className="sm:col-span-2"
                      label="Bullet list"
                      hint="One item per line. Leave blank for no list."
                      value={s.bullets}
                      onChange={(v) => writeSection(i, { bullets: v })}
                      textarea
                      rows={3}
                    />
                    <Field
                      className="sm:col-span-2"
                      label="Button label"
                      hint="Optional. Adds a button linking to the category page; leave blank for none."
                      value={s.cta}
                      onChange={(v) => writeSection(i, { cta: v })}
                    />
                  </div>
                </EditorRow>
              ))}
            </div>
          )}
        </Section>

        {/* FAQ */}
        <Section
          title="FAQ"
          count={article.faqs.length}
          action={
            <Button size="sm" onClick={addFaq}>
              <Plus className="size-3.5" />
              Add question
            </Button>
          }
        >
          <Field
            className="mb-4"
            label="FAQ subheading"
            value={article.faqLead}
            onChange={(v) => writeArticle({ faqLead: v })}
          />
          {article.faqs.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              label="No questions yet"
              hint="Questions appear as an expandable list at the foot of the article."
            />
          ) : (
            <div className="space-y-2">
              {article.faqs.map((f, i) => (
                <EditorRow
                  key={i}
                  title={f.question || "Untitled question"}
                  subtitle={f.answer}
                  defaultOpen={f.question === "New question"}
                  onDelete={() => removeFaq(i)}
                >
                  <div className="grid gap-4">
                    <Field
                      label="Question"
                      value={f.question}
                      onChange={(v) => writeFaq(i, { question: v })}
                    />
                    <Field
                      label="Answer"
                      value={f.answer}
                      onChange={(v) => writeFaq(i, { answer: v })}
                      textarea
                      rows={3}
                    />
                  </div>
                </EditorRow>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
