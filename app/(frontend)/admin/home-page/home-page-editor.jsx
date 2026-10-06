"use client";

import { useState, useTransition } from "react";

import { IconHome } from "@/components/icons/ds-icons";
import { Field } from "@/components/admin/field";
import { Section } from "@/components/admin/editor-ui";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";
import { SaveBar } from "@/components/admin/save-bar";
import { AuditMeta } from "@/components/admin/audit-meta";
import { countChanges } from "@/lib/count-changes";
import { saveHomePage } from "./actions";

// The home page's editable text, grouped in the order it appears on the site.
// Saving is review-gated like articles: admins publish, editors submit.
export function HomePageEditor({ initial, isAdmin, pendingReview, audit }) {
  const [draft, setDraft] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [phase, setPhase] = useState("idle"); // idle | saving | error
  const [submitted, setSubmitted] = useState(pendingReview);
  const [, startTransition] = useTransition();

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const changeCount = countChanges(draft, saved);
  const fieldDirty = (k) => (draft[k] ?? "") !== (saved[k] ?? "");
  const blank = Object.values(draft).some((v) => !String(v).trim());
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const save = () => {
    // Every field renders as a heading or paragraph — don't round-trip a
    // doomed save; surface it.
    if (blank) {
      setPhase("error");
      return;
    }
    const snapshot = draft;
    startTransition(async () => {
      setPhase("saving");
      try {
        const res = await saveHomePage(snapshot);
        if (!res?.ok) throw new Error(res?.error);
        setSaved(snapshot); // advance the baseline so dirty clears
        if (!isAdmin) setSubmitted(true);
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

  // Shared props for one copy field.
  const field = (key, label, extra = {}) => ({
    label,
    required: true,
    value: draft[key],
    onChange: (v) => set({ [key]: v }),
    dirty: fieldDirty(key),
    ...extra,
  });

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
            <IconHome className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-ds-xl font-bold text-foreground">
              Home page
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
                ? "Text on the public home page. Saving publishes it."
                : "Text on the public home page. Changes go live once an admin approves them."}
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
        <Section title="Hero" description="The first thing visitors see, above the Quick Access cards.">
          <div className="grid gap-4">
            <Field {...field("heroTitle", "Title")} />
            <Field {...field("heroLead", "Lead", { textarea: true, rows: 2, hint: "Bold line under the title." })} />
            <Field {...field("heroDescription", "Description", { textarea: true, rows: 3 })} />
          </div>
        </Section>

        <Section title="Services section" description="Heading above the grid of service categories.">
          <Field {...field("servicesTitle", "Title")} />
        </Section>

        <Section title="Contacts section" description="Heading and subtitle above the contacts table.">
          <div className="grid gap-4">
            <Field {...field("contactsTitle", "Title")} />
            <Field {...field("contactsSubtitle", "Subtitle")} />
          </div>
        </Section>

        {phase === "error" && blank ? (
          <p className="mt-6 text-ds-xxs font-medium text-destructive">
            Every field needs some text — a blank one would leave an empty
            heading on the site.
          </p>
        ) : null}
      </div>
    </div>
  );
}
