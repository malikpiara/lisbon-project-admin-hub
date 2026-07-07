"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ExternalLink,
  FileText,
  History,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Field } from "@/components/admin/field";
import { IconPicker } from "@/components/admin/icon-picker";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  EmptyState,
  MoveControls,
  Section,
} from "@/components/admin/editor-ui";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";
import { DiffText, SplitDiff } from "@/components/admin/diff-text";
import { diffWords } from "@/lib/diff-text";
import { SaveBar } from "@/components/admin/save-bar";
import { countChanges } from "@/lib/count-changes";
import { useFlip } from "@/lib/use-flip";
import { cn } from "@/lib/utils";
import { AuditMeta } from "@/components/admin/audit-meta";
import { getServiceIcon, getServiceIconKey } from "@/lib/service-icons";
import {
  deleteService,
  restoreServiceVersion,
  saveService,
} from "../actions";
import { createTopic, reorderTopics } from "../../articles/actions";

// Map Payload's stored shape <-> the editor draft. The string list `intro` is
// an array of { text } in Payload (a named subfield is required); the editor
// treats it as a blank-line-separated textarea. Contacts moved out of the
// service into their own collection (edited at /admin/contacts), so the service
// editor no longer touches contacts or the old per-service categoryFilters.
function fromPayload(s) {
  return {
    title: s.title ?? "",
    shortDescription: s.shortDescription ?? "",
    intro: (s.intro ?? []).map((p) => p.text).join("\n\n"),
    iconKey: s.iconKey ?? "",
    contactsTitle: s.contactsTitle ?? "",
    contactsSubtitle: s.contactsSubtitle ?? "",
  };
}

function toPayload(d) {
  return {
    title: d.title,
    shortDescription: d.shortDescription,
    intro: d.intro
      .split(/\n\s*\n/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({ text })),
    iconKey: d.iconKey,
    contactsTitle: d.contactsTitle,
    contactsSubtitle: d.contactsSubtitle,
  };
}

export function ServiceEditor({ service, topics, audit, versions = [] }) {
  const [draft, setDraft] = useState(() => fromPayload(service));
  // Share draft's initial object so contact `_k`s match the baseline (separate
  // fromPayload calls would assign different keys and read as dirty on load).
  const [saved, setSaved] = useState(() => draft);
  const [phase, setPhase] = useState("idle"); // idle | saving | error
  const [isPending, startTransition] = useTransition();

  // Topics reorder is deferred (local order, persisted on Save) rather than the
  // old instant server-action + router.refresh — so rows slide (FLIP), the moved
  // topic pulses + stays marked until saved, and reorders feed the change count.
  const topicById = Object.fromEntries(topics.map((t) => [t.id, t]));
  const topicIds = topics.map((t) => t.id);
  const topicKey = topicIds.join("|");
  const [topicOrder, setTopicOrder] = useState(topicIds);
  const [savedTopicOrder, setSavedTopicOrder] = useState(topicIds);
  const [topicSyncKey, setTopicSyncKey] = useState(topicKey);
  const [flashTopicId, setFlashTopicId] = useState(null);
  const topicFlip = useFlip();
  // Re-sync to server membership when topics are added/deleted (adjust during
  // render, preserving any pending local reorder of the topics that remain).
  if (topicSyncKey !== topicKey) {
    setTopicSyncKey(topicKey);
    setSavedTopicOrder(topicIds);
    setTopicOrder((prev) => {
      const kept = prev.filter((id) => topicIds.includes(id));
      const added = topicIds.filter((id) => !kept.includes(id));
      return [...kept, ...added];
    });
  }
  const topicOrderDirty = topicOrder.join("|") !== savedTopicOrder.join("|");
  const reorderedTopicCount = topicOrder.reduce(
    (n, id, i) => n + (savedTopicOrder.indexOf(id) !== i ? 1 : 0),
    0
  );

  // Honest diff: derived by comparing the working draft to the last-saved
  // snapshot (the old one-way latch never relaxed). Field edits and topic
  // reorders feed dirty and the change count.
  const fieldsDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const dirty = fieldsDirty || topicOrderDirty;
  const changeCount = countChanges(draft, saved) + reorderedTopicCount;
  const fieldDirty = (a, b) => (a ?? "") !== (b ?? "");

  const moveTopic = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= topicOrder.length) return;
    const movedId = topicOrder[i];
    setTopicOrder((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setFlashTopicId(movedId);
    setTimeout(() => setFlashTopicId((c) => (c === movedId ? null : c)), 700);
  };

  const set = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
  };

  const save = () => {
    const snapshot = draft;
    const orderSnapshot = topicOrder;
    startTransition(async () => {
      setPhase("saving");
      try {
        // Only re-save the service when fields changed, so a topic-only reorder
        // doesn't create a spurious service version.
        if (fieldsDirty) {
          await saveService(service.id, toPayload(snapshot));
          setSaved(snapshot); // advance the baseline so dirty clears
        }
        if (topicOrderDirty) {
          await reorderTopics(orderSnapshot, service.id);
          setSavedTopicOrder(orderSnapshot);
        }
        setPhase("idle");
      } catch {
        setPhase("error");
      }
    });
  };

  const discard = () => {
    setDraft(saved);
    setTopicOrder(savedTopicOrder);
    setPhase("idle");
  };

  // PROTOTYPE (#2): restore a past version, then reload so the editor re-reads
  // the restored document.
  const restore = (versionId) =>
    startTransition(async () => {
      await restoreServiceVersion(versionId, service.id);
      window.location.reload();
    });

  const Icon = getServiceIcon(getServiceIconKey(service.slug, draft.iconKey));

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
                <BreadcrumbLink href="/admin/services">
                  Services &amp; Information
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {draft.title || "Untitled category"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <Icon className="size-5" strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <h1 className="truncate font-heading text-ds-xl font-bold text-foreground">
                  {draft.title || "Untitled category"}
                </h1>
                <p className="truncate font-mono text-ds-xxs text-muted-foreground">
                  /services/{service.slug}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <Link
                href={`/services/${service.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                View on site
                <ExternalLink className="size-3.5" />
              </Link>
              <DeleteButton
                onConfirm={() =>
                  startTransition(async () => {
                    await deleteService(service.id);
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {audit && (audit.modified || audit.created) ? (
        <div className="border-b-2 border-border bg-card">
          <div className="mx-auto max-w-5xl px-8 py-4">
            <AuditMeta audit={audit} />
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-5xl px-8 pt-10 pb-28">
        <Section
          title="Basics"
          description="How this category appears on the home grid and its own page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              className="sm:col-span-2"
              label="Title"
              required
              value={draft.title}
              onChange={(v) => set({ title: v })}
              dirty={fieldDirty(draft.title, saved.title)}
              hint="Shown on the home grid card, the category page, and the breadcrumb trail."
            />
            <Field
              className="sm:col-span-2"
              label="Short description"
              value={draft.shortDescription}
              onChange={(v) => set({ shortDescription: v })}
              dirty={fieldDirty(draft.shortDescription, saved.shortDescription)}
              textarea
              rows={2}
              hint="Copy for the home grid card."
            />
            <Field
              className="sm:col-span-2"
              label="Intro paragraphs"
              value={draft.intro}
              onChange={(v) => set({ intro: v })}
              dirty={fieldDirty(draft.intro, saved.intro)}
              textarea
              rows={4}
              hint="Paragraphs separated by a blank line."
            />
            <IconPicker
              className="sm:col-span-2"
              label="Icon"
              value={draft.iconKey}
              onChange={(v) => set({ iconKey: v })}
            />
          </div>
        </Section>

        <Section
          title="Contacts page header"
          description="Heading shown above the contacts table on this category's page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Section title"
              value={draft.contactsTitle}
              onChange={(v) => set({ contactsTitle: v })}
              dirty={fieldDirty(draft.contactsTitle, saved.contactsTitle)}
            />
            <Field
              label="Section subtitle"
              value={draft.contactsSubtitle}
              onChange={(v) => set({ contactsSubtitle: v })}
              dirty={fieldDirty(draft.contactsSubtitle, saved.contactsSubtitle)}
            />
          </div>
        </Section>

        <Section
          title="Articles"
          count={topicOrder.length}
          description="The articles on this category's page. Open one to edit its content."
          action={
            <form action={createTopic.bind(null, service.id)}>
              <Button size="sm" type="submit">
                <Plus className="size-3.5" />
                Add article
              </Button>
            </form>
          }
        >
          {topicOrder.length === 0 ? (
            <EmptyState
              icon={FileText}
              label="No articles yet"
              hint="Articles become the cards on this category's page."
            />
          ) : (
            <div className="space-y-2">
              {topicOrder.map((id, i) => {
                const t = topicById[id];
                if (!t) return null;
                const moved = savedTopicOrder.indexOf(id) !== i;
                return (
                  <div
                    key={id}
                    ref={topicFlip(id)}
                    className={cn(
                      "flex items-center gap-1 overflow-hidden rounded-lg border-2 border-border bg-card transition-colors hover:border-foreground/20",
                      moved && "border-brand-300 bg-muted",
                      flashTopicId === id && "reorder-flash"
                    )}
                  >
                    <Link
                      href={`/admin/articles/${t.id}`}
                      className="group flex min-w-0 flex-1 items-center gap-3 px-4 py-3 outline-none focus-visible:bg-secondary/40"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-ds-xs font-bold text-foreground">
                          {t.title || "Untitled article"}
                        </span>
                        {t.description ? (
                          <span className="block truncate text-ds-xxs font-medium text-muted-foreground">
                            {t.description}
                          </span>
                        ) : null}
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    {moved ? (
                      <span className="rounded-full bg-secondary px-2 py-0.5 text-ds-xxs font-bold text-primary">
                        Moved
                      </span>
                    ) : null}
                    <div className="pr-2">
                      <MoveControls
                        onMoveUp={() => moveTopic(i, -1)}
                        onMoveDown={() => moveTopic(i, 1)}
                        isFirst={i === 0}
                        isLast={i === topicOrder.length - 1}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <Section
          title="Version history"
          count={versions.length}
          description="Every save is snapshotted. Restore brings a past version back as the current content."
        >
          {versions.length === 0 ? (
            <EmptyState
              icon={History}
              label="No versions yet"
              hint="Each save will appear here as a restorable snapshot."
            />
          ) : (
            <div className="space-y-2">
              {versions.map((v, i) => (
                <div
                  key={v.id}
                  className="rounded-lg border-2 border-border bg-card px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-ds-xs font-bold text-foreground">
                        {v.at}
                        {i === 0 ? (
                          <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-ds-xxs font-bold text-primary">
                            current
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 text-ds-xxs font-medium text-muted-foreground">
                        by {v.who}
                      </p>
                    </div>
                    {i === 0 ? null : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => restore(v.id)}
                        disabled={isPending}
                      >
                        <RotateCcw className="size-3.5" />
                        Restore
                      </Button>
                    )}
                  </div>
                  <VersionChanges changes={v.changes} />
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

// What a save changed — the diff that makes the version history actually
// useful. Short text renders as an inline word diff; long text gets the
// Before/After split so a one-word edit in a paragraph is findable at a
// glance instead of two truncated blobs.
function VersionChanges({ changes }) {
  if (changes === null) {
    return (
      <p className="mt-2 border-t-2 border-border pt-2 text-ds-xxs font-medium text-muted-foreground">
        First tracked version.
      </p>
    );
  }
  if (changes.length === 0) {
    return (
      <p className="mt-2 border-t-2 border-border pt-2 text-ds-xxs font-medium text-muted-foreground">
        No content changes.
      </p>
    );
  }
  return (
    <ul className="mt-2 space-y-1.5 border-t-2 border-border pt-2">
      {changes.map((c, ci) => {
        if (c.from == null) {
          return (
            <li
              key={ci}
              className="text-ds-xxs font-medium leading-relaxed text-muted-foreground"
            >
              <span className="font-bold text-foreground">{c.label}:</span>{" "}
              <span className="text-foreground">{c.to}</span>
            </li>
          );
        }
        const ops = diffWords(c.from, c.to);
        const long = c.from.length + c.to.length > 160;
        return (
          <li
            key={ci}
            className="text-ds-xxs font-medium leading-relaxed text-muted-foreground"
          >
            <span className="font-bold text-foreground">{c.label}:</span>{" "}
            {long ? (
              <SplitDiff ops={ops} className="mt-1.5 bg-card" />
            ) : (
              <DiffText ops={ops} className="text-foreground" />
            )}
          </li>
        );
      })}
    </ul>
  );
}
