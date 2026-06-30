"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Contact,
  ExternalLink,
  FileText,
  History,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/field";
import { IconPicker } from "@/components/admin/icon-picker";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  EditorRow,
  EmptyState,
  MoveControls,
  Section,
} from "@/components/admin/editor-ui";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";
import { AuditMeta } from "@/components/admin/audit-meta";
import { getServiceIcon, getServiceIconKey } from "@/lib/service-icons";
import {
  deleteService,
  restoreServiceVersion,
  saveService,
} from "../actions";
import { createTopic, reorderTopics } from "../../topics/actions";

// Map Payload's stored shape <-> the editor draft. The string lists are arrays
// of { text } in Payload (a named subfield is required); the editor treats intro
// as a blank-line-separated textarea, like the /admin prototype.
function fromPayload(s) {
  return {
    title: s.title ?? "",
    breadcrumb: s.breadcrumb ?? "",
    shortDescription: s.shortDescription ?? "",
    intro: (s.intro ?? []).map((p) => p.text).join("\n\n"),
    iconKey: s.iconKey ?? "",
    contactsTitle: s.contactsTitle ?? "",
    contactsSubtitle: s.contactsSubtitle ?? "",
    categoryFilters: (s.categoryFilters ?? []).map((c) => c.value ?? ""),
    contacts: (s.contacts ?? []).map((c) => ({
      organization: c.organization ?? "",
      service: c.service ?? "",
      phone: c.phone ?? "",
      email: c.email ?? "",
      category: c.category ?? "",
    })),
  };
}

function toPayload(d) {
  return {
    title: d.title,
    breadcrumb: d.breadcrumb,
    shortDescription: d.shortDescription,
    intro: d.intro
      .split(/\n\s*\n/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((text) => ({ text })),
    iconKey: d.iconKey,
    contactsTitle: d.contactsTitle,
    contactsSubtitle: d.contactsSubtitle,
    categoryFilters: d.categoryFilters
      .map((v) => v.trim())
      .filter(Boolean)
      .map((value) => ({ value })),
    contacts: d.contacts,
  };
}

export function ServiceEditor({ service, topics, audit, versions = [] }) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => fromPayload(service));
  const [status, setStatus] = useState("saved"); // saved | dirty | saving | error
  const [isPending, startTransition] = useTransition();
  const [reordering, startReorder] = useTransition();

  const moveTopic = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= topics.length) return;
    const ids = topics.map((t) => t.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    startReorder(async () => {
      await reorderTopics(ids, service.id);
      router.refresh();
    });
  };

  const set = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
    setStatus("dirty");
  };
  const setContact = (i, patch) => {
    setDraft((d) => ({
      ...d,
      contacts: d.contacts.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    }));
    setStatus("dirty");
  };
  const addContact = () => {
    setDraft((d) => ({
      ...d,
      contacts: [
        ...d.contacts,
        { organization: "New organization", service: "", phone: "", email: "", category: "" },
      ],
    }));
    setStatus("dirty");
  };
  const removeContact = (i) => {
    setDraft((d) => ({ ...d, contacts: d.contacts.filter((_, idx) => idx !== i) }));
    setStatus("dirty");
  };
  const moveContact = (i, dir) => {
    setDraft((d) => {
      const arr = [...d.contacts];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return d;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...d, contacts: arr };
    });
    setStatus("dirty");
  };
  const duplicateContact = (i) => {
    setDraft((d) => {
      const arr = [...d.contacts];
      arr.splice(i + 1, 0, { ...arr[i] });
      return { ...d, contacts: arr };
    });
    setStatus("dirty");
  };
  const setCategoryFilter = (i, v) => {
    setDraft((d) => ({
      ...d,
      categoryFilters: d.categoryFilters.map((c, idx) => (idx === i ? v : c)),
    }));
    setStatus("dirty");
  };
  const addCategoryFilter = () => {
    setDraft((d) => ({ ...d, categoryFilters: [...d.categoryFilters, ""] }));
    setStatus("dirty");
  };
  const removeCategoryFilter = (i) => {
    setDraft((d) => ({
      ...d,
      categoryFilters: d.categoryFilters.filter((_, idx) => idx !== i),
    }));
    setStatus("dirty");
  };

  const save = () =>
    startTransition(async () => {
      setStatus("saving");
      try {
        await saveService(service.id, toPayload(draft));
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });

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
      <UnsavedChangesGuard when={status === "dirty"} />
      <div className="sticky top-0 z-10 border-b-2 border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-8 py-4">
          <Link
            href="/admin/services"
            className="inline-flex items-center gap-1.5 text-ds-xxs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            All categories
          </Link>

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
              <SaveState status={status} />
              <Button
                size="sm"
                onClick={save}
                disabled={status === "saved" || status === "saving" || isPending}
              >
                Save
              </Button>
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

      <div className="mx-auto max-w-5xl px-8 py-10">
        <Section
          title="Basics"
          description="How this category appears on the home grid and its own page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Title"
              required
              value={draft.title}
              onChange={(v) => set({ title: v })}
              hint="Shown on the home grid card and the category page."
            />
            <Field
              label="Breadcrumb label"
              value={draft.breadcrumb}
              onChange={(v) => set({ breadcrumb: v })}
              hint="Short label for the breadcrumb trail."
            />
            <Field
              className="sm:col-span-2"
              label="Short description"
              value={draft.shortDescription}
              onChange={(v) => set({ shortDescription: v })}
              textarea
              rows={2}
              hint="Copy for the home grid card."
            />
            <Field
              className="sm:col-span-2"
              label="Intro paragraphs"
              value={draft.intro}
              onChange={(v) => set({ intro: v })}
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
            />
            <Field
              label="Section subtitle"
              value={draft.contactsSubtitle}
              onChange={(v) => set({ contactsSubtitle: v })}
            />
          </div>
        </Section>

        <Section
          title="Contact categories"
          count={draft.categoryFilters.length}
          description="Filter chips above the contacts table. Each contact's Category should match one of these."
          action={
            <Button size="sm" onClick={addCategoryFilter}>
              <Plus className="size-3.5" />
              Add category
            </Button>
          }
        >
          {draft.categoryFilters.length === 0 ? (
            <EmptyState
              icon={Contact}
              label="No categories yet"
              hint="Add categories so visitors can filter the contacts table."
            />
          ) : (
            <div className="space-y-2">
              {draft.categoryFilters.map((value, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={value}
                    onChange={(e) => setCategoryFilter(i, e.target.value)}
                    placeholder="e.g. Housing"
                  />
                  <button
                    type="button"
                    aria-label="Remove category"
                    onClick={() => removeCategoryFilter(i)}
                    className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Topics"
          count={topics.length}
          description="Each topic is an article on this category's page. Open one to edit its content."
          action={
            <form action={createTopic.bind(null, service.id)}>
              <Button size="sm" type="submit">
                <Plus className="size-3.5" />
                Add topic
              </Button>
            </form>
          }
        >
          {topics.length === 0 ? (
            <EmptyState
              icon={FileText}
              label="No topics yet"
              hint="Topics become the article cards on this category's page."
            />
          ) : (
            <div className="space-y-2">
              {topics.map((t, i) => (
                <div
                  key={t.id}
                  className="flex items-center gap-1 overflow-hidden rounded-lg border-2 border-border bg-card transition-colors hover:border-foreground/20"
                >
                  <Link
                    href={`/admin/topics/${t.id}`}
                    className="group flex min-w-0 flex-1 items-center gap-3 px-4 py-3 outline-none focus-visible:bg-secondary/40"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-ds-xs font-bold text-foreground">
                        {t.title || "Untitled topic"}
                      </span>
                      {t.description ? (
                        <span className="block truncate text-ds-xxs font-medium text-muted-foreground">
                          {t.description}
                        </span>
                      ) : null}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <div className="pr-2">
                    <MoveControls
                      onMoveUp={() => moveTopic(i, -1)}
                      onMoveDown={() => moveTopic(i, 1)}
                      isFirst={i === 0}
                      isLast={i === topics.length - 1}
                      disabled={reordering}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Contacts"
          count={draft.contacts.length}
          action={
            <Button size="sm" onClick={addContact}>
              <Plus className="size-3.5" />
              Add contact
            </Button>
          }
        >
          {draft.contacts.length === 0 ? (
            <EmptyState
              icon={Contact}
              label="No contacts yet"
              hint="Contacts appear in the table on this category's page."
            />
          ) : (
            <div className="space-y-2">
              {draft.contacts.map((contact, i) => (
                <EditorRow
                  key={i}
                  title={contact.organization || "New organization"}
                  subtitle={[contact.category, contact.service]
                    .filter(Boolean)
                    .join(" · ")}
                  defaultOpen={contact.organization === "New organization"}
                  onDelete={() => removeContact(i)}
                  onMoveUp={() => moveContact(i, -1)}
                  onMoveDown={() => moveContact(i, 1)}
                  onDuplicate={() => duplicateContact(i)}
                  isFirst={i === 0}
                  isLast={i === draft.contacts.length - 1}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Organization"
                      required
                      value={contact.organization}
                      onChange={(v) => setContact(i, { organization: v })}
                    />
                    <Field
                      label="Category"
                      value={contact.category}
                      onChange={(v) => setContact(i, { category: v })}
                    />
                    <Field
                      className="sm:col-span-2"
                      label="Service description"
                      value={contact.service}
                      onChange={(v) => setContact(i, { service: v })}
                    />
                    <Field
                      label="Phone"
                      value={contact.phone}
                      onChange={(v) => setContact(i, { phone: v })}
                    />
                    <Field
                      label="Email"
                      type="email"
                      value={contact.email}
                      onChange={(v) => setContact(i, { email: v })}
                    />
                  </div>
                </EditorRow>
              ))}
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

function clip(value) {
  return value.length > 48 ? `${value.slice(0, 47)}…` : value;
}

// What a save changed — the diff that makes the version history actually useful.
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
    <ul className="mt-2 space-y-1 border-t-2 border-border pt-2">
      {changes.map((c, ci) => (
        <li
          key={ci}
          className="text-ds-xxs font-medium leading-relaxed text-muted-foreground"
        >
          <span className="font-bold text-foreground">{c.label}:</span>{" "}
          {c.from != null ? (
            <>
              <span className="rounded bg-destructive/10 px-1 text-destructive line-through">
                {clip(c.from) || "(empty)"}
              </span>{" "}
              &rarr;{" "}
              <span className="rounded bg-secondary px-1 text-primary">
                {clip(c.to) || "(empty)"}
              </span>
            </>
          ) : (
            <span className="text-foreground">{c.to}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
