"use client";

import { useState, useTransition } from "react";

import { IconGlobe, IconMinus, IconPlus } from "@/components/icons/ds-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, DirtyDot } from "@/components/admin/field";
import { Section } from "@/components/admin/editor-ui";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";
import { SaveBar } from "@/components/admin/save-bar";
import { AuditMeta } from "@/components/admin/audit-meta";
import { countChanges } from "@/lib/count-changes";
import {
  SITE_TEXT_FIELDS,
  SITE_TEXT_SECTIONS,
  validateSiteText,
} from "@/lib/site-text-defaults";
import { saveSiteText } from "./actions";

// All of the site's editable text, one section per place it appears, in page
// order. Sections and fields come from lib/site-text-defaults.js. Saving is
// review-gated like articles: admins publish, editors submit.
export function SiteTextEditor({ initial, isAdmin, pendingReview, audit }) {
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [phase, setPhase] = useState("idle"); // idle | saving | error
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(pendingReview);
  const [, startTransition] = useTransition();

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const changeCount = countChanges(draft, saved);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const save = () => {
    // Same rules the server applies — surface them before a doomed round-trip.
    const checked = validateSiteText(draft);
    if (!checked.ok) {
      setError(checked.error);
      setPhase("error");
      return;
    }
    const snapshot = draft;
    startTransition(async () => {
      setPhase("saving");
      setError(null);
      try {
        const res = await saveSiteText(snapshot);
        if (!res?.ok) throw new Error(res?.error);
        setSaved(snapshot); // advance the baseline so dirty clears
        if (!isAdmin) setSubmitted(true);
        setPhase("idle");
      } catch (err) {
        setError(err?.message || null);
        setPhase("error");
      }
    });
  };

  const discard = () => {
    setDraft(saved);
    setError(null);
    setPhase("idle");
  };

  const renderField = (f) => {
    if (f.kind === "hours") {
      return (
        <HoursField
          key={f.key}
          label={f.label}
          rows={draft[f.key]}
          onChange={(rows) => set({ [f.key]: rows })}
          dirty={JSON.stringify(draft[f.key]) !== JSON.stringify(saved[f.key])}
        />
      );
    }
    return (
      <Field
        key={f.key}
        label={f.label}
        required={f.required}
        value={draft[f.key]}
        onChange={(v) => set({ [f.key]: v })}
        dirty={(draft[f.key] ?? "") !== (saved[f.key] ?? "")}
        textarea={f.kind === "textarea"}
        rows={f.kind === "textarea" ? 2 : undefined}
        hint={f.hint}
        placeholder={f.placeholder}
        type={f.kind === "url" ? "url" : "text"}
      />
    );
  };

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
        saveLabel={isAdmin ? "Save" : "Submit for review"}
        savingLabel={isAdmin ? "Saving…" : "Submitting…"}
      />

      <div className="sticky top-0 z-10 border-b-2 border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-8 py-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
            <IconGlobe className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-ds-xl font-bold text-foreground">
              Site text
              {submitted ? (
                <span
                  className="ml-2 inline-block rounded-full border-2 border-border px-2 py-0.5 align-middle text-ds-xxs font-bold text-muted-foreground"
                  title={
                    isAdmin
                      ? "An editor submitted changes — approve or decline them under Review"
                      : "Your changes are waiting for an admin to approve them"
                  }
                >
                  Pending review
                </span>
              ) : null}
            </h1>
            <p className="truncate text-ds-xxs font-medium text-muted-foreground">
              {isAdmin
                ? "Text that appears across the public site. Saving publishes it."
                : "Text that appears across the public site. Changes go live once an admin approves them."}
            </p>
          </div>
        </div>
      </div>

      {audit?.modified ? (
        <div className="border-b-2 border-border bg-card">
          <div className="mx-auto max-w-5xl px-8 py-4">
            <AuditMeta audit={audit} />
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-5xl px-8 pt-10 pb-28">
        {SITE_TEXT_SECTIONS.map((s) => (
          <Section key={s.id} title={s.title} description={s.description}>
            <div className="grid gap-4 sm:grid-cols-2">
              {SITE_TEXT_FIELDS.filter((f) => f.section === s.id).map((f) => (
                <div
                  key={f.key}
                  className={
                    f.kind === "textarea" || f.kind === "hours" ? "sm:col-span-2" : undefined
                  }
                >
                  {renderField(f)}
                </div>
              ))}
            </div>
          </Section>
        ))}

        {phase === "error" && error ? (
          <p className="mt-6 text-ds-xxs font-medium text-destructive">{error}</p>
        ) : null}
      </div>
    </div>
  );
}

// Opening hours: one row per rule (days · hours), add/remove. Order is the
// order shown on the site; blank rows are dropped on save.
function HoursField({ label, rows, onChange, dirty }) {
  const setRow = (i, patch) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-ds-xs font-medium text-foreground">
        {label}
        {dirty ? <DirtyDot /> : null}
      </p>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
              <Input
                value={r.day}
                onChange={(e) => setRow(i, { day: e.target.value })}
                placeholder="Days, e.g. Mon, Tue, Thu"
                aria-label={`Days, row ${i + 1}`}
              />
              <Input
                value={r.hours}
                onChange={(e) => setRow(i, { hours: e.target.value })}
                placeholder="Hours, e.g. 10:00–17:30"
                aria-label={`Hours, row ${i + 1}`}
              />
            </div>
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
              aria-label={`Remove row ${i + 1}`}
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
        onClick={() => onChange([...rows, { day: "", hours: "" }])}
      >
        <IconPlus className="size-3.5" />
        Add row
      </Button>
      <p className="mt-1 text-ds-xxs font-medium text-muted-foreground">
        Leave all rows out to hide the list (the heading and note stay).
      </p>
    </div>
  );
}
