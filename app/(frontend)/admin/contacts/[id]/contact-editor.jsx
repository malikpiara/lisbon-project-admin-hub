"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Field, DirtyDot } from "@/components/admin/field";
import { DeleteButton } from "@/components/admin/delete-button";
import { Section } from "@/components/admin/editor-ui";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";
import { SaveBar } from "@/components/admin/save-bar";
import { countChanges } from "@/lib/count-changes";
import { cn } from "@/lib/utils";
import { AuditMeta } from "@/components/admin/audit-meta";
import { deleteContact, saveContact } from "../actions";

// Normalise Payload's stored shape to the editor draft. `categories` comes back
// as Service objects at depth ≥1; the editor works in service ids.
function fromDoc(c) {
  return {
    organization: c.organization ?? "",
    service: c.service ?? "",
    phone: c.phone ?? "",
    email: c.email ?? "",
    categories: (c.categories ?? []).map((cat) =>
      typeof cat === "object" && cat ? cat.id : cat,
    ),
  };
}

export function ContactEditor({ contact, services, audit }) {
  const [draft, setDraft] = useState(() => fromDoc(contact));
  const [saved, setSaved] = useState(() => fromDoc(contact));
  const [phase, setPhase] = useState("idle"); // idle | saving | error
  const [, startTransition] = useTransition();

  const fieldsDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const changeCount = countChanges(draft, saved);
  const fieldDirty = (a, b) => (a ?? "") !== (b ?? "");
  const categoriesDirty =
    JSON.stringify(draft.categories) !== JSON.stringify(saved.categories);
  const noCategories = draft.categories.length === 0;

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const toggleCategory = (id) =>
    setDraft((d) => ({
      ...d,
      categories: d.categories.includes(id)
        ? d.categories.filter((c) => c !== id)
        : [...d.categories, id],
    }));

  const save = () => {
    // `categories` is required — don't round-trip a doomed save; surface it.
    if (noCategories) {
      setPhase("error");
      return;
    }
    const snapshot = draft;
    startTransition(async () => {
      setPhase("saving");
      try {
        await saveContact(contact.id, snapshot);
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

  return (
    <div>
      <UnsavedChangesGuard when={fieldsDirty} />
      <SaveBar
        dirty={fieldsDirty}
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
                <BreadcrumbLink href="/admin/contacts">Contacts</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {draft.organization || "Untitled contact"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-3 flex items-center justify-between gap-4">
            <h1 className="min-w-0 truncate font-heading text-ds-xl font-bold text-foreground">
              {draft.organization || "Untitled contact"}
            </h1>
            <DeleteButton
              onConfirm={() =>
                startTransition(async () => {
                  await deleteContact(contact.id);
                })
              }
            />
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
          title="Details"
          description="How this contact appears in the contacts table."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Organization"
              required
              value={draft.organization}
              onChange={(v) => set({ organization: v })}
              dirty={fieldDirty(draft.organization, saved.organization)}
            />
            <Field
              label="Email"
              type="email"
              value={draft.email}
              onChange={(v) => set({ email: v })}
              dirty={fieldDirty(draft.email, saved.email)}
            />
            <Field
              label="Phone"
              value={draft.phone}
              onChange={(v) => set({ phone: v })}
              dirty={fieldDirty(draft.phone, saved.phone)}
            />
            <Field
              className="sm:col-span-2"
              label="Service provided"
              value={draft.service}
              onChange={(v) => set({ service: v })}
              dirty={fieldDirty(draft.service, saved.service)}
              textarea
              rows={2}
              hint="What the organization does — the “Service Provided” column. Distinct from the categories below."
            />
          </div>
        </Section>

        <Section
          title={
            <span className="inline-flex items-center gap-2">
              Categories
              {categoriesDirty ? <DirtyDot /> : null}
            </span>
          }
          count={draft.categories.length}
          description="The services this contact belongs to. It appears on each of these category pages, and once in “All Contacts”."
        >
          <div className="flex flex-wrap gap-2">
            {services.map((s) => {
              const on = draft.categories.includes(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleCategory(s.id)}
                  className={cn(
                    "rounded-full border-2 px-3 py-1.5 text-ds-xxs font-bold transition-colors",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-foreground hover:border-foreground/30",
                  )}
                >
                  {s.title}
                </button>
              );
            })}
          </div>
          {noCategories ? (
            <p className="mt-3 text-ds-xxs font-bold text-destructive">
              Select at least one category — a contact must belong to a service.
            </p>
          ) : null}
        </Section>
      </div>
    </div>
  );
}
