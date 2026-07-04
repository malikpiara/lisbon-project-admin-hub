"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, FileText, HelpCircle, Link2, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, DirtyDot, SelectField } from "@/components/admin/field";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditorRow, EmptyState, Section } from "@/components/admin/editor-ui";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";
import { SaveBar } from "@/components/admin/save-bar";
import { countChanges } from "@/lib/count-changes";
import { useFlip } from "@/lib/use-flip";
import { cn } from "@/lib/utils";
import { AuditMeta } from "@/components/admin/audit-meta";
import { deleteTopic, saveTopic } from "../actions";
import { ArticlePreview } from "./article-preview";

// Stable client-only keys per section/FAQ row so reordering can animate (FLIP)
// and mark the moved row by identity. toPayload reconstructs explicit fields, so
// `_k` is naturally dropped before saving.
let _rowKeySeq = 0;
const nextRowKey = () => `r${_rowKeySeq++}`;

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
      _k: nextRowKey(),
      heading: s.heading ?? "",
      lead: s.lead ?? "",
      body: s.body ?? "",
      bullets: (s.bullets ?? []).map((b) => b.text).join("\n"),
      ordered: s.ordered ?? false,
      cta: s.cta ?? "",
      ctaHref: s.ctaHref ?? "",
    })),
    keyLinks: (a.keyLinks ?? []).map((l) => ({
      _k: nextRowKey(),
      label: l.label ?? "",
      href: l.href ?? "",
    })),
    faqLead: a.faqLead ?? "",
    faqs: (a.faqs ?? []).map((f) => ({
      _k: nextRowKey(),
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
      keyLinks: d.keyLinks.map((l) => ({ label: l.label, href: l.href })),
      faqLead: d.faqLead,
      faqs: d.faqs.map((f) => ({ question: f.question, answer: f.answer })),
    },
    // Which service this article belongs to. Editing it reassigns the topic
    // (and changes its public URL); saveTopic handles the move + revalidation.
    service: d.serviceId,
  };
}

export function ArticleEditor({ topic, service, services = [], audit }) {
  const [draft, setDraft] = useState(() => ({
    ...fromPayload(topic),
    serviceId: service?.id ?? "",
  }));
  // Share draft's initial object so section/FAQ `_k`s match the baseline (separate
  // fromPayload calls would assign different keys and read as dirty on load).
  const [saved, setSaved] = useState(() => draft);
  const [phase, setPhase] = useState("idle"); // idle | saving | error
  const [isPending, startTransition] = useTransition();
  const sectionFlip = useFlip();
  const keyLinkFlip = useFlip();
  const faqFlip = useFlip();
  const [flashSectionKey, setFlashSectionKey] = useState(null);
  const [flashKeyLinkKey, setFlashKeyLinkKey] = useState(null);
  const [flashFaqKey, setFlashFaqKey] = useState(null);

  // Reorder by identity (`_k`): a row is "moved" when its key sits at a different
  // index than in the saved baseline. Wash/count compare by key too, so moving an
  // unedited row doesn't light up its fields.
  const savedSectionKeys = saved.sections.map((s) => s._k);
  const savedSectionByK = Object.fromEntries(
    saved.sections.map((s) => [s._k, s])
  );
  const reorderedSectionCount = draft.sections.reduce((n, s, i) => {
    const si = savedSectionKeys.indexOf(s._k);
    return n + (si !== -1 && si !== i ? 1 : 0);
  }, 0);
  const savedKeyLinkKeys = saved.keyLinks.map((l) => l._k);
  const savedKeyLinkByK = Object.fromEntries(
    saved.keyLinks.map((l) => [l._k, l])
  );
  const reorderedKeyLinkCount = draft.keyLinks.reduce((n, l, i) => {
    const si = savedKeyLinkKeys.indexOf(l._k);
    return n + (si !== -1 && si !== i ? 1 : 0);
  }, 0);
  const savedFaqKeys = saved.faqs.map((f) => f._k);
  const savedFaqByK = Object.fromEntries(saved.faqs.map((f) => [f._k, f]));
  const reorderedFaqCount = draft.faqs.reduce((n, f, i) => {
    const si = savedFaqKeys.indexOf(f._k);
    return n + (si !== -1 && si !== i ? 1 : 0);
  }, 0);

  // Honest diff: dirty derived from draft-vs-snapshot, so reverting clears it.
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const changeCount =
    countChanges(draft, saved) +
    reorderedSectionCount +
    reorderedKeyLinkCount +
    reorderedFaqCount;
  const fieldDirty = (a, b) => (a ?? "") !== (b ?? "");

  const set = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
  };
  const setSection = (i, patch) => {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
  };
  const addSection = () => {
    setDraft((d) => ({
      ...d,
      sections: [
        ...d.sections,
        { _k: nextRowKey(), heading: "New section", lead: "", body: "", bullets: "", ordered: false, cta: "", ctaHref: "" },
      ],
    }));
  };
  const removeSection = (i) => {
    setDraft((d) => ({ ...d, sections: d.sections.filter((_, idx) => idx !== i) }));
  };
  const moveSection = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= draft.sections.length) return;
    const movedKey = draft.sections[i]._k;
    setDraft((d) => {
      const arr = [...d.sections];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...d, sections: arr };
    });
    setFlashSectionKey(movedKey);
    setTimeout(() => setFlashSectionKey((c) => (c === movedKey ? null : c)), 700);
  };
  const duplicateSection = (i) => {
    setDraft((d) => {
      const arr = [...d.sections];
      arr.splice(i + 1, 0, { ...arr[i], _k: nextRowKey() });
      return { ...d, sections: arr };
    });
  };
  const setKeyLink = (i, patch) => {
    setDraft((d) => ({
      ...d,
      keyLinks: d.keyLinks.map((l, idx) =>
        idx === i ? { ...l, ...patch } : l
      ),
    }));
  };
  const addKeyLink = () => {
    setDraft((d) => ({
      ...d,
      keyLinks: [
        ...d.keyLinks,
        { _k: nextRowKey(), label: "New link", href: "" },
      ],
    }));
  };
  const removeKeyLink = (i) => {
    setDraft((d) => ({
      ...d,
      keyLinks: d.keyLinks.filter((_, idx) => idx !== i),
    }));
  };
  const moveKeyLink = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= draft.keyLinks.length) return;
    const movedKey = draft.keyLinks[i]._k;
    setDraft((d) => {
      const arr = [...d.keyLinks];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...d, keyLinks: arr };
    });
    setFlashKeyLinkKey(movedKey);
    setTimeout(
      () => setFlashKeyLinkKey((c) => (c === movedKey ? null : c)),
      700
    );
  };
  const duplicateKeyLink = (i) => {
    setDraft((d) => {
      const arr = [...d.keyLinks];
      arr.splice(i + 1, 0, { ...arr[i], _k: nextRowKey() });
      return { ...d, keyLinks: arr };
    });
  };
  const setFaq = (i, patch) => {
    setDraft((d) => ({
      ...d,
      faqs: d.faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    }));
  };
  const addFaq = () => {
    setDraft((d) => ({
      ...d,
      faqs: [...d.faqs, { _k: nextRowKey(), question: "New question", answer: "" }],
    }));
  };
  const removeFaq = (i) => {
    setDraft((d) => ({ ...d, faqs: d.faqs.filter((_, idx) => idx !== i) }));
  };
  const moveFaq = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= draft.faqs.length) return;
    const movedKey = draft.faqs[i]._k;
    setDraft((d) => {
      const arr = [...d.faqs];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...d, faqs: arr };
    });
    setFlashFaqKey(movedKey);
    setTimeout(() => setFlashFaqKey((c) => (c === movedKey ? null : c)), 700);
  };
  const duplicateFaq = (i) => {
    setDraft((d) => {
      const arr = [...d.faqs];
      arr.splice(i + 1, 0, { ...arr[i], _k: nextRowKey() });
      return { ...d, faqs: arr };
    });
  };

  const save = () => {
    const snapshot = draft;
    startTransition(async () => {
      setPhase("saving");
      try {
        await saveTopic(topic.id, toPayload(snapshot));
        setSaved(snapshot); // advance the baseline so dirty clears
        setPhase("idle");
      } catch {
        setPhase("error");
      }
    });
  };

  const discard = () => {
    setDraft(saved);
    setPhase("idle");
  };

  const serviceSlug = service?.slug ?? "";
  const publicHref = serviceSlug
    ? `/services/${serviceSlug}/${topic.slug}`
    : null;

  const serviceOptions = services.map((s) => ({ value: s.id, label: s.title }));
  // The service currently chosen in the draft — may differ from the original
  // `service` prop once the editor reassigns it. `serviceChanged` drives the
  // move warning + the field's dirty dot (compared to the saved baseline).
  const selectedService =
    services.find((s) => s.id === draft.serviceId) ?? service;
  const serviceChanged = draft.serviceId !== saved.serviceId;

  return (
    <div>
      <UnsavedChangesGuard when={dirty} />
      <SaveBar
        dirty={dirty}
        count={changeCount}
        saving={phase === "saving"}
        error={phase === "error"}
        onSave={save}
        onDiscard={discard}
      />
      <div className="sticky top-0 z-10 border-b-2 border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-8 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/articles">Articles</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {service ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/admin/services/${service.id}`}>
                      {service.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              ) : null}
              <BreadcrumbItem>
                <BreadcrumbPage>{draft.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <FileText className="size-5" strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <h1 className="truncate font-heading text-ds-xl font-bold text-foreground">
                  {draft.title || "Untitled article"}
                </h1>
                <p className="truncate font-mono text-ds-xxs text-muted-foreground">
                  /services/{serviceSlug}/{topic.slug}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
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

      {audit && (audit.modified || audit.created) ? (
        <div className="border-b-2 border-border bg-card">
          <div className="mx-auto max-w-6xl px-8 py-4">
            <AuditMeta audit={audit} />
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-6xl gap-8 px-8 pt-10 pb-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
        <div className="min-w-0">
        <Section
          title="Basics"
          description="The title and summary shown on the service page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Title"
              required
              value={draft.title}
              onChange={(v) => set({ title: v })}
              dirty={fieldDirty(draft.title, saved.title)}
            />
            <SelectField
              label="Service"
              value={draft.serviceId}
              onChange={(v) => set({ serviceId: v })}
              options={serviceOptions}
              dirty={serviceChanged}
              hint="Which service this article lives under."
            />
            {serviceChanged && selectedService ? (
              <div className="rounded-lg border-2 border-brand-300 bg-muted px-4 py-3 text-ds-xxs font-medium text-foreground sm:col-span-2">
                Saving moves this article to{" "}
                <span className="font-bold">{selectedService.title}</span> and
                changes its public link from{" "}
                <span className="font-mono">
                  /services/{service?.slug}/{topic.slug}
                </span>{" "}
                to{" "}
                <span className="font-mono">
                  /services/{selectedService.slug}/{topic.slug}
                </span>
                . Existing links to the old address will stop working.
              </div>
            ) : null}
            <Field
              className="sm:col-span-2"
              label="Description"
              hint="Shown on the service page card, and reused as the intro line."
              value={draft.description}
              onChange={(v) => set({ description: v })}
              dirty={fieldDirty(draft.description, saved.description)}
              textarea
              rows={2}
            />
            <Field
              className="sm:col-span-2"
              label="Hero subheading"
              hint="The bold line under the title at the top of the article."
              value={draft.heroLead}
              onChange={(v) => set({ heroLead: v })}
              dirty={fieldDirty(draft.heroLead, saved.heroLead)}
            />
          </div>
        </Section>

        <Section
          title="Key links"
          description="Shortcut links shown at the top of the article, before the content sections."
          count={draft.keyLinks.length}
          action={
            <Button size="sm" onClick={addKeyLink}>
              <Plus className="size-3.5" />
              Add link
            </Button>
          }
        >
          {draft.keyLinks.length === 0 ? (
            <EmptyState
              icon={Link2}
              label="No key links yet"
              hint="Key links appear as a short list of shortcuts at the top of the article."
            />
          ) : (
            <div className="space-y-2">
              {draft.keyLinks.map((l, i) => {
                const lc = savedKeyLinkByK[l._k];
                const si = savedKeyLinkKeys.indexOf(l._k);
                const moved = si !== -1 && si !== i;
                return (
                  <div key={l._k} ref={keyLinkFlip(l._k)}>
                    <EditorRow
                      title={l.label || "Untitled link"}
                      subtitle={l.href}
                      defaultOpen={l.label === "New link"}
                      onDelete={() => removeKeyLink(i)}
                      onMoveUp={() => moveKeyLink(i, -1)}
                      onMoveDown={() => moveKeyLink(i, 1)}
                      onDuplicate={() => duplicateKeyLink(i)}
                      isFirst={i === 0}
                      isLast={i === draft.keyLinks.length - 1}
                      marked={moved}
                      flashing={flashKeyLinkKey === l._k}
                    >
                      <div className="grid gap-4">
                        <Field
                          label="Label"
                          required
                          value={l.label}
                          onChange={(v) => setKeyLink(i, { label: v })}
                          dirty={fieldDirty(l.label, lc?.label)}
                        />
                        <Field
                          label="Link"
                          required
                          hint="Use /path for an internal page or https://… for an external site."
                          value={l.href}
                          onChange={(v) => setKeyLink(i, { href: v })}
                          dirty={fieldDirty(l.href, lc?.href)}
                          placeholder="/path or https://…"
                        />
                      </div>
                    </EditorRow>
                  </div>
                );
              })}
            </div>
          )}
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
              {draft.sections.map((s, i) => {
                const sc = savedSectionByK[s._k];
                const si = savedSectionKeys.indexOf(s._k);
                const moved = si !== -1 && si !== i;
                return (
                  <div key={s._k} ref={sectionFlip(s._k)}>
                    <EditorRow
                      title={s.heading || "Untitled section"}
                      subtitle={s.lead}
                      defaultOpen={s.heading === "New section"}
                      onDelete={() => removeSection(i)}
                      onMoveUp={() => moveSection(i, -1)}
                      onMoveDown={() => moveSection(i, 1)}
                      onDuplicate={() => duplicateSection(i)}
                      isFirst={i === 0}
                      isLast={i === draft.sections.length - 1}
                      marked={moved}
                      flashing={flashSectionKey === s._k}
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          label="Heading"
                          required
                          value={s.heading}
                          onChange={(v) => setSection(i, { heading: v })}
                          dirty={fieldDirty(s.heading, sc?.heading)}
                        />
                        <Field
                          label="Lead"
                          hint="Teal intro line above the body."
                          value={s.lead}
                          onChange={(v) => setSection(i, { lead: v })}
                          dirty={fieldDirty(s.lead, sc?.lead)}
                        />
                        <Field
                          className="sm:col-span-2"
                          label="Body"
                          hint="Paragraphs — separate them with a blank line."
                          value={s.body}
                          onChange={(v) => setSection(i, { body: v })}
                          dirty={fieldDirty(s.body, sc?.body)}
                          textarea
                          rows={4}
                        />
                        <Field
                          className="sm:col-span-2"
                          label="Bullet list"
                          hint="One item per line. Leave blank for no list."
                          value={s.bullets}
                          onChange={(v) => setSection(i, { bullets: v })}
                          dirty={fieldDirty(s.bullets, sc?.bullets)}
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
                          {fieldDirty(s.ordered, sc?.ordered) ? <DirtyDot /> : null}
                        </label>
                        <Field
                          className="sm:col-span-2"
                          label="Button label"
                          hint="Optional. Adds a button to this section; leave blank for none."
                          value={s.cta}
                          onChange={(v) => setSection(i, { cta: v })}
                          dirty={fieldDirty(s.cta, sc?.cta)}
                        />
                        <Field
                          className="sm:col-span-2"
                          label="Button link"
                          hint="Where the button points. Use /path for an internal page or https://… for an external site. Leave blank to link to the service page."
                          value={s.ctaHref}
                          onChange={(v) => setSection(i, { ctaHref: v })}
                          dirty={fieldDirty(s.ctaHref, sc?.ctaHref)}
                          placeholder="/path or https://…"
                        />
                      </div>
                    </EditorRow>
                  </div>
                );
              })}
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
            dirty={fieldDirty(draft.faqLead, saved.faqLead)}
          />
          {draft.faqs.length === 0 ? (
            <EmptyState
              icon={HelpCircle}
              label="No questions yet"
              hint="Questions appear as an expandable list at the foot of the article."
            />
          ) : (
            <div className="space-y-2">
              {draft.faqs.map((f, i) => {
                const fc = savedFaqByK[f._k];
                const si = savedFaqKeys.indexOf(f._k);
                const moved = si !== -1 && si !== i;
                return (
                  <div key={f._k} ref={faqFlip(f._k)}>
                    <EditorRow
                      title={f.question || "Untitled question"}
                      subtitle={f.answer}
                      defaultOpen={f.question === "New question"}
                      onDelete={() => removeFaq(i)}
                      onMoveUp={() => moveFaq(i, -1)}
                      onMoveDown={() => moveFaq(i, 1)}
                      onDuplicate={() => duplicateFaq(i)}
                      isFirst={i === 0}
                      isLast={i === draft.faqs.length - 1}
                      marked={moved}
                      flashing={flashFaqKey === f._k}
                    >
                      <div className="grid gap-4">
                        <Field
                          label="Question"
                          required
                          value={f.question}
                          onChange={(v) => setFaq(i, { question: v })}
                          dirty={fieldDirty(f.question, fc?.question)}
                        />
                        <Field
                          label="Answer"
                          value={f.answer}
                          onChange={(v) => setFaq(i, { answer: v })}
                          dirty={fieldDirty(f.answer, fc?.answer)}
                          textarea
                          rows={3}
                        />
                      </div>
                    </EditorRow>
                  </div>
                );
              })}
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
