"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, FileText, HelpCircle, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/admin/field";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditorRow, EmptyState, Section } from "@/components/admin/editor-ui";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";
import { deleteTopic, saveTopic } from "../actions";
import { ArticlePreview } from "./article-preview";

// Payload <-> editor mapping. The big reconciliation is `bullets`: Payload models
// it as an array of { text }, the editor (and the public renderer) treat it as a
// blank-line/newline textarea — one item per line.
function fromPayload(topic) {
  const a = topic.article ?? {};
  return {
    title: topic.title ?? "",
    description: topic.description ?? "",
    heroLead: a.heroLead ?? "",
    sections: (a.sections ?? []).map((s) => ({
      heading: s.heading ?? "",
      lead: s.lead ?? "",
      body: s.body ?? "",
      bullets: (s.bullets ?? []).map((b) => b.text).join("\n"),
      ordered: s.ordered ?? false,
      cta: s.cta ?? "",
      ctaHref: s.ctaHref ?? "",
    })),
    faqLead: a.faqLead ?? "",
    faqs: (a.faqs ?? []).map((f) => ({
      question: f.question ?? "",
      answer: f.answer ?? "",
    })),
  };
}

function toPayload(d) {
  return {
    title: d.title,
    description: d.description,
    article: {
      heroLead: d.heroLead,
      sections: d.sections.map((s) => ({
        heading: s.heading,
        lead: s.lead,
        body: s.body,
        bullets: s.bullets
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean)
          .map((text) => ({ text })),
        ordered: s.ordered,
        cta: s.cta,
        ctaHref: s.ctaHref,
      })),
      faqLead: d.faqLead,
      faqs: d.faqs.map((f) => ({ question: f.question, answer: f.answer })),
    },
  };
}

export function TopicEditor({ topic, service, audit }) {
  const [draft, setDraft] = useState(() => fromPayload(topic));
  const [status, setStatus] = useState("saved"); // saved | dirty | saving | error
  const [isPending, startTransition] = useTransition();

  const set = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
    setStatus("dirty");
  };
  const setSection = (i, patch) => {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
    setStatus("dirty");
  };
  const addSection = () => {
    setDraft((d) => ({
      ...d,
      sections: [
        ...d.sections,
        { heading: "New section", lead: "", body: "", bullets: "", ordered: false, cta: "", ctaHref: "" },
      ],
    }));
    setStatus("dirty");
  };
  const removeSection = (i) => {
    setDraft((d) => ({ ...d, sections: d.sections.filter((_, idx) => idx !== i) }));
    setStatus("dirty");
  };
  const moveSection = (i, dir) => {
    setDraft((d) => {
      const arr = [...d.sections];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return d;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...d, sections: arr };
    });
    setStatus("dirty");
  };
  const duplicateSection = (i) => {
    setDraft((d) => {
      const arr = [...d.sections];
      arr.splice(i + 1, 0, { ...arr[i] });
      return { ...d, sections: arr };
    });
    setStatus("dirty");
  };
  const setFaq = (i, patch) => {
    setDraft((d) => ({
      ...d,
      faqs: d.faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    }));
    setStatus("dirty");
  };
  const addFaq = () => {
    setDraft((d) => ({
      ...d,
      faqs: [...d.faqs, { question: "New question", answer: "" }],
    }));
    setStatus("dirty");
  };
  const removeFaq = (i) => {
    setDraft((d) => ({ ...d, faqs: d.faqs.filter((_, idx) => idx !== i) }));
    setStatus("dirty");
  };
  const moveFaq = (i, dir) => {
    setDraft((d) => {
      const arr = [...d.faqs];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return d;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...d, faqs: arr };
    });
    setStatus("dirty");
  };
  const duplicateFaq = (i) => {
    setDraft((d) => {
      const arr = [...d.faqs];
      arr.splice(i + 1, 0, { ...arr[i] });
      return { ...d, faqs: arr };
    });
    setStatus("dirty");
  };

  const save = () =>
    startTransition(async () => {
      setStatus("saving");
      try {
        await saveTopic(topic.id, toPayload(draft));
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });

  const serviceSlug = service?.slug ?? "";
  const publicHref = serviceSlug
    ? `/services/${serviceSlug}/${topic.slug}`
    : null;

  return (
    <div>
      <UnsavedChangesGuard when={status === "dirty"} />
      <div className="sticky top-0 z-10 border-b-2 border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-8 py-4">
          <nav className="text-ds-xxs font-medium text-muted-foreground">
            <Link href="/studio/services" className="hover:text-foreground">
              Services
            </Link>
            <span className="mx-1.5">/</span>
            {service ? (
              <>
                <Link
                  href={`/studio/services/${service.id}`}
                  className="hover:text-foreground"
                >
                  {service.title}
                </Link>
                <span className="mx-1.5">/</span>
              </>
            ) : null}
            <span className="text-foreground">{draft.title}</span>
          </nav>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <FileText className="size-5" strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <h1 className="truncate font-heading text-ds-xl font-bold text-foreground">
                  {draft.title || "Untitled topic"}
                </h1>
                <p className="truncate font-mono text-ds-xxs text-muted-foreground">
                  /services/{serviceSlug}/{topic.slug}
                </p>
                {audit && (audit.modified || audit.created) ? (
                  <p className="text-ds-xxs font-medium text-muted-foreground">
                    {audit.modified ? <>Last modified {audit.modified}</> : null}
                    {audit.modified && audit.created ? " · " : null}
                    {audit.created ? <>Created {audit.created}</> : null}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <SaveState status={status} />
              <Button
                size="sm"
                onClick={save}
                disabled={status === "saved" || status === "saving" || isPending}
              >
                Save
              </Button>
              {publicHref ? (
                <Link
                  href={publicHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  View on site
                  <ExternalLink className="size-3.5" />
                </Link>
              ) : null}
              <DeleteButton
                onConfirm={() =>
                  startTransition(async () => {
                    await deleteTopic(topic.id, service?.id);
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-8 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
        <div className="min-w-0">
        <Section
          title="Basics"
          description="The title and summary shown on the category page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Title"
              required
              value={draft.title}
              onChange={(v) => set({ title: v })}
            />
            <Field
              className="sm:col-span-2"
              label="Description"
              hint="Shown on the category card and reused as the intro line."
              value={draft.description}
              onChange={(v) => set({ description: v })}
              textarea
              rows={2}
            />
            <Field
              className="sm:col-span-2"
              label="Hero subheading"
              hint="The bold line under the title at the top of the article."
              value={draft.heroLead}
              onChange={(v) => set({ heroLead: v })}
            />
          </div>
        </Section>

        <Section
          title="Article sections"
          count={draft.sections.length}
          action={
            <Button size="sm" onClick={addSection}>
              <Plus className="size-3.5" />
              Add section
            </Button>
          }
        >
          {draft.sections.length === 0 ? (
            <EmptyState
              icon={FileText}
              label="No sections yet"
              hint="Sections become the titled content blocks on the article page."
            />
          ) : (
            <div className="space-y-2">
              {draft.sections.map((s, i) => (
                <EditorRow
                  key={i}
                  title={s.heading || "Untitled section"}
                  subtitle={s.lead}
                  defaultOpen={s.heading === "New section"}
                  onDelete={() => removeSection(i)}
                  onMoveUp={() => moveSection(i, -1)}
                  onMoveDown={() => moveSection(i, 1)}
                  onDuplicate={() => duplicateSection(i)}
                  isFirst={i === 0}
                  isLast={i === draft.sections.length - 1}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Heading"
                      required
                      value={s.heading}
                      onChange={(v) => setSection(i, { heading: v })}
                    />
                    <Field
                      label="Lead"
                      hint="Teal intro line above the body."
                      value={s.lead}
                      onChange={(v) => setSection(i, { lead: v })}
                    />
                    <Field
                      className="sm:col-span-2"
                      label="Body"
                      hint="Paragraphs — separate them with a blank line."
                      value={s.body}
                      onChange={(v) => setSection(i, { body: v })}
                      textarea
                      rows={4}
                    />
                    <Field
                      className="sm:col-span-2"
                      label="Bullet list"
                      hint="One item per line. Leave blank for no list."
                      value={s.bullets}
                      onChange={(v) => setSection(i, { bullets: v })}
                      textarea
                      rows={3}
                    />
                    <label className="flex items-center gap-2 text-ds-xs font-medium text-foreground sm:col-span-2">
                      <Checkbox
                        checked={s.ordered === true}
                        onCheckedChange={(checked) =>
                          setSection(i, { ordered: checked === true })
                        }
                      />
                      Numbered list — show items as 1, 2, 3 instead of bullets
                    </label>
                    <Field
                      className="sm:col-span-2"
                      label="Button label"
                      hint="Optional. Adds a button to this section; leave blank for none."
                      value={s.cta}
                      onChange={(v) => setSection(i, { cta: v })}
                    />
                    <Field
                      className="sm:col-span-2"
                      label="Button link"
                      hint="Where the button points. Use /path for an internal page or https://… for an external site. Leave blank to link to the category page."
                      value={s.ctaHref}
                      onChange={(v) => setSection(i, { ctaHref: v })}
                      placeholder="/path or https://…"
                    />
                  </div>
                </EditorRow>
              ))}
            </div>
          )}
        </Section>

        <Section
          title="FAQ"
          count={draft.faqs.length}
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
            value={draft.faqLead}
            onChange={(v) => set({ faqLead: v })}
          />
          {draft.faqs.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              label="No questions yet"
              hint="Questions appear as an expandable list at the foot of the article."
            />
          ) : (
            <div className="space-y-2">
              {draft.faqs.map((f, i) => (
                <EditorRow
                  key={i}
                  title={f.question || "Untitled question"}
                  subtitle={f.answer}
                  defaultOpen={f.question === "New question"}
                  onDelete={() => removeFaq(i)}
                  onMoveUp={() => moveFaq(i, -1)}
                  onMoveDown={() => moveFaq(i, 1)}
                  onDuplicate={() => duplicateFaq(i)}
                  isFirst={i === 0}
                  isLast={i === draft.faqs.length - 1}
                >
                  <div className="grid gap-4">
                    <Field
                      label="Question"
                      required
                      value={f.question}
                      onChange={(v) => setFaq(i, { question: v })}
                    />
                    <Field
                      label="Answer"
                      value={f.answer}
                      onChange={(v) => setFaq(i, { answer: v })}
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

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ArticlePreview draft={draft} topicTitle={draft.title} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function SaveState({ status }) {
  const map = {
    saved: { label: "Saved", cls: "text-muted-foreground" },
    dirty: { label: "Unsaved changes", cls: "text-brand-link" },
    saving: { label: "Saving…", cls: "text-muted-foreground" },
    error: { label: "Save failed — retry", cls: "text-destructive" },
  };
  const s = map[status] ?? map.saved;
  return <span className={`text-ds-xxs font-medium ${s.cls}`}>{s.label}</span>;
}
