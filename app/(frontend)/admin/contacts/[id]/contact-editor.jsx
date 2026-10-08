"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
// DS lacks a trash glyph — lucide, as in the other editors; flagged for Rafael.
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconPlus } from "@/components/icons/ds-icons";
import {
  SOCIAL_LABELS,
  SOCIAL_NETWORKS,
  contactChannels,
} from "@/lib/contact-channels";
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

// Stable client-only keys per channel row, so countChanges matches rows by
// identity and a reorder/removal doesn't read as every row changing.
let _rowSeq = 0;
const rowKey = () => `ch${_rowSeq++}`;

// Normalise Payload's stored shape to the editor draft. `categories` comes back
// as Service objects at depth ≥1; the editor works in service ids. Channels go
// through lib/contact-channels, which folds the pre-October single phone/email
// into one-item lists.
function fromDoc(c) {
  const ch = contactChannels(c);
  return {
    organization: c.organization ?? "",
    service: c.service ?? "",
    phones: ch.phones.map((p) => ({ _k: rowKey(), ...p })),
    emails: ch.emails.map((address) => ({ _k: rowKey(), address })),
    websites: ch.websites.map((w) => ({ _k: rowKey(), ...w })),
    socials: ch.socials.map((s) => ({ _k: rowKey(), ...s })),
    categories: (c.categories ?? []).map((cat) =>
      typeof cat === "object" && cat ? cat.id : cat,
    ),
  };
}

// Editor draft → what saveContact stores. Empty rows are dropped, and the
// legacy single fields are cleared so the lists are the only source from now.
function toDoc(d) {
  const strip = (rows) => rows.map(({ _k: _key, ...r }) => r);
  return {
    organization: d.organization,
    service: d.service,
    categories: d.categories,
    phones: strip(d.phones).filter((p) => p.number.trim()),
    emails: strip(d.emails).filter((e) => e.address.trim()),
    websites: strip(d.websites).filter((w) => w.url.trim()),
    socials: strip(d.socials).filter((s) => s.handle.trim()),
    phone: null,
    email: null,
  };
}

const rowInput = "h-10 px-3 text-ds-xxs";

// A list of channel rows: inputs per row, a remove button, an add button.
// `render(row, patch)` draws the row's inputs.
function ChannelRows({ title, rows, onChange, empty, addLabel, render, hint }) {
  const update = (k, patch) =>
    onChange(rows.map((r) => (r._k === k ? { ...r, ...patch } : r)));
  const remove = (k) => onChange(rows.filter((r) => r._k !== k));
  const add = () => onChange([...rows, { _k: rowKey(), ...empty }]);
  return (
    <div>
      <span className="mb-1.5 block text-ds-xs font-medium text-foreground">{title}</span>
      {rows.length ? (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r._k} className="flex items-center gap-2">
              <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">{render(r, (patch) => update(r._k, patch))}</div>
              <button
                type="button"
                aria-label={`Remove ${title.toLowerCase().replace(/s$/, "")}`}
                onClick={() => remove(r._k)}
                className="grid size-9 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <Button type="button" variant="ghost" size="sm" onClick={add} className={rows.length ? "mt-2" : ""}>
        <IconPlus className="size-3.5" />
        {addLabel}
      </Button>
      {hint ? (
        <span className="mt-1 block text-ds-xxs font-medium text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}

export function ContactEditor({ contact, services, audit }) {
  const [draft, setDraft] = useState(() => fromDoc(contact));
  // Share the initial object so row keys match between draft and baseline.
  const [saved, setSaved] = useState(() => draft);
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
              Contact channels
              {JSON.stringify([draft.phones, draft.emails, draft.websites, draft.socials]) !==
              JSON.stringify([saved.phones, saved.emails, saved.websites, saved.socials]) ? (
                <DirtyDot />
              ) : null}
            </span>
          }
          description="Each entry is one line in the Contact column, with its icon. Leave out what the organisation doesn't have."
        >
          <div className="grid gap-6">
            <ChannelRows
              title="Emails"
              rows={draft.emails}
              onChange={(emails) => set({ emails })}
              empty={{ address: "" }}
              addLabel="Add email"
              render={(r, patch) => (
                <Input
                  type="email"
                  value={r.address}
                  onChange={(e) => patch({ address: e.target.value })}
                  placeholder="info@organisation.pt"
                  aria-label="Email address"
                  className={cn(rowInput, "sm:col-span-2")}
                />
              )}
            />
            <ChannelRows
              title="Phones"
              rows={draft.phones}
              onChange={(phones) => set({ phones })}
              empty={{ number: "", label: "" }}
              addLabel="Add phone"
              render={(r, patch) => (
                <>
                  <Input
                    value={r.number}
                    onChange={(e) => patch({ number: e.target.value })}
                    placeholder="+351 961 740 421"
                    aria-label="Phone number"
                    className={rowInput}
                  />
                  <Input
                    value={r.label}
                    onChange={(e) => patch({ label: e.target.value })}
                    placeholder="Label, e.g. Helpline (optional)"
                    aria-label="Phone label"
                    className={rowInput}
                  />
                </>
              )}
            />
            <ChannelRows
              title="Social profiles"
              rows={draft.socials}
              onChange={(socials) => set({ socials })}
              empty={{ network: "instagram", handle: "" }}
              addLabel="Add social profile"
              hint="@handle, a number for WhatsApp, or the full address."
              render={(r, patch) => (
                <>
                  <Select
                    items={SOCIAL_LABELS}
                    value={r.network}
                    onValueChange={(v) => patch({ network: v ?? "other" })}
                  >
                    <SelectTrigger aria-label="Network" className="h-10 text-ds-xxs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_NETWORKS.map((n) => (
                        <SelectItem key={n} value={n}>
                          {SOCIAL_LABELS[n]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={r.handle}
                    onChange={(e) => patch({ handle: e.target.value })}
                    placeholder={r.network === "whatsapp" ? "+351 …" : "@handle or https://…"}
                    aria-label="Profile"
                    className={rowInput}
                  />
                </>
              )}
            />
            <ChannelRows
              title="Websites"
              rows={draft.websites}
              onChange={(websites) => set({ websites })}
              empty={{ url: "", label: "" }}
              addLabel="Add website"
              render={(r, patch) => (
                <>
                  <Input
                    value={r.url}
                    onChange={(e) => patch({ url: e.target.value })}
                    placeholder="www.organisation.pt"
                    aria-label="Website address"
                    className={rowInput}
                  />
                  <Input
                    value={r.label}
                    onChange={(e) => patch({ label: e.target.value })}
                    placeholder="Shown text, e.g. Book online (optional)"
                    aria-label="Website label"
                    className={rowInput}
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
