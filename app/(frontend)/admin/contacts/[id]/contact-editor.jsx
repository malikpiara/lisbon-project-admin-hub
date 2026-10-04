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
import { Field, DirtyDot, SelectField } from "@/components/admin/field";
import { Input } from "@/components/ui/input";
import { IconMinus, IconPlus } from "@/components/icons/ds-icons";
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
// PROTOTYPE (team feedback · Rafael's contacts layout): repeatable channels.
// The deprecated single phone/email are folded into the arrays on load, so
// saving an old contact migrates it (the single fields are then cleared).
function fromDoc(c) {
  const phones = (c.phones ?? []).map((p) => ({ number: p.number ?? "", label: p.label ?? "" }));
  if (!phones.length && (c.phone ?? "").trim()) phones.push({ number: c.phone, label: "" });
  const emails = (c.emails ?? []).map((e) => ({ address: e.address ?? "" }));
  if (!emails.length && (c.email ?? "").trim()) emails.push({ address: c.email });
  return {
    organization: c.organization ?? "",
    service: c.service ?? "",
    phones,
    emails,
    websites: (c.websites ?? []).map((w) => ({ url: w.url ?? "", label: w.label ?? "" })),
    socials: (c.socials ?? []).map((s) => ({ network: s.network ?? "instagram", handle: s.handle ?? "" })),
    address: c.address ?? "",
    openingHours: c.openingHours ?? "",
    categories: (c.categories ?? []).map((cat) =>
      typeof cat === "object" && cat ? cat.id : cat,
    ),
  };
}

// What goes to Payload: drop blank rows, clear the deprecated single fields.
function toDoc(d) {
  return {
    ...d,
    phones: d.phones.filter((p) => p.number.trim()),
    emails: d.emails.filter((e) => e.address.trim()),
    websites: d.websites.filter((w) => w.url.trim()),
    socials: d.socials.filter((s) => s.handle.trim()),
    phone: "",
    email: "",
  };
}

const SOCIAL_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "other", label: "Other" },
];

// A small repeatable list: one line per entry, add/remove, no reordering
// (order rarely matters for a phone list). `columns` renders one row's inputs.
function RowsField({ label, hint, rows, onChange, empty, addLabel, columns }) {
  const setRow = (i, patch) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));
  return (
    <div>
      <p className="mb-1.5 text-ds-xs font-medium text-foreground">{label}</p>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1fr_minmax(0,0.8fr)]">
              {columns(r, (patch) => setRow(i, patch))}
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label={`Remove ${label.toLowerCase()} ${i + 1}`}
              className="mt-2 grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
            >
              <IconMinus className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <Button
        size="sm"
        variant="secondary"
        className="mt-2"
        onClick={() => onChange([...rows, empty()])}
      >
        <IconPlus className="size-3.5" />
        {addLabel}
      </Button>
      {hint ? (
        <p className="mt-1 text-ds-xxs font-medium text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
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
        await saveContact(contact.id, toDoc(snapshot));
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
              label="Service provided"
              value={draft.service}
              onChange={(v) => set({ service: v })}
              dirty={fieldDirty(draft.service, saved.service)}
              textarea
              rows={2}
              hint="What the organization does — the “Service” column. Distinct from the categories below."
            />
            <Field
              label="Address"
              value={draft.address}
              onChange={(v) => set({ address: v })}
              dirty={fieldDirty(draft.address, saved.address)}
              textarea
              rows={2}
              hint="Street address. Also where the Directions button points; without it the button searches the organisation name."
            />
            <Field
              className="sm:col-span-2"
              label="Opening hours"
              value={draft.openingHours}
              onChange={(v) => set({ openingHours: v })}
              dirty={fieldDirty(draft.openingHours, saved.openingHours)}
              textarea
              rows={2}
              placeholder={"Mon, Tue, Thu: 10:00–13:00 / 14:00–18:00\nWed: 10:00–19:30"}
              hint="One line per rule. Shown under the service text."
            />
          </div>
        </Section>

        <Section
          title="Contact channels"
          description="Each entry becomes one line in the Contact column, with its icon. Leave a channel empty and nothing is shown for it."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <RowsField
              label="Phones"
              rows={draft.phones}
              onChange={(rows) => set({ phones: rows })}
              empty={() => ({ number: "", label: "" })}
              addLabel="Add phone"
              columns={(r, patch) => (
                <>
                  <Input
                    value={r.number}
                    onChange={(e) => patch({ number: e.target.value })}
                    placeholder="+351 961 740 421"
                    inputMode="tel"
                  />
                  <Input
                    value={r.label}
                    onChange={(e) => patch({ label: e.target.value })}
                    placeholder="Label (optional)"
                  />
                </>
              )}
            />
            <RowsField
              label="Emails"
              rows={draft.emails}
              onChange={(rows) => set({ emails: rows })}
              empty={() => ({ address: "" })}
              addLabel="Add email"
              columns={(r, patch) => (
                <Input
                  className="sm:col-span-2"
                  type="email"
                  value={r.address}
                  onChange={(e) => patch({ address: e.target.value })}
                  placeholder="info@organisation.pt"
                />
              )}
            />
            <RowsField
              label="Websites"
              rows={draft.websites}
              onChange={(rows) => set({ websites: rows })}
              empty={() => ({ url: "", label: "" })}
              addLabel="Add website"
              columns={(r, patch) => (
                <>
                  <Input
                    value={r.url}
                    onChange={(e) => patch({ url: e.target.value })}
                    placeholder="https://www.organisation.pt"
                    inputMode="url"
                  />
                  <Input
                    value={r.label}
                    onChange={(e) => patch({ label: e.target.value })}
                    placeholder="Label (optional)"
                  />
                </>
              )}
            />
            <RowsField
              label="Social profiles"
              rows={draft.socials}
              onChange={(rows) => set({ socials: rows })}
              empty={() => ({ network: "instagram", handle: "" })}
              addLabel="Add profile"
              hint="@handle, a number for WhatsApp, or a full link."
              columns={(r, patch) => (
                <>
                  <SelectField
                    value={r.network}
                    onChange={(v) => patch({ network: v })}
                    options={SOCIAL_OPTIONS}
                  />
                  <Input
                    value={r.handle}
                    onChange={(e) => patch({ handle: e.target.value })}
                    placeholder="@lisbonproject"
                  />
                </>
              )}
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
          description="The services this contact belongs to. It appears on each of these category pages, and once in “External Contacts”."
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
