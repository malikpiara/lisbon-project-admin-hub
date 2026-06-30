"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/admin/field";
import { DeleteButton } from "@/components/admin/delete-button";
import { MoveControls } from "@/components/admin/editor-ui";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";
import {
  createQuickAccessItem,
  deleteQuickAccessItem,
  reorderQuickAccessItems,
  saveQuickAccessItem,
} from "./actions";

// Payload-backed Quick Access editor. Same DS components; data flows through
// Payload server actions instead of the localStorage store. Two ideas borrowed
// from the Payload teardown: field hints, and a visible save state (the DB
// write is async, so the editor needs to show "Unsaved changes → Saving →
// Saved").
export function QuickAccessEditor({ initialItems, userEmail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Each card tracks its own save state; aggregate them so the guard fires while
  // ANY card has unsaved edits. reportDirty is stable (useCallback) so the cards'
  // effects don't re-run on every render, and the setter bails when unchanged.
  const [dirtyMap, setDirtyMap] = useState({});
  const reportDirty = useCallback((id, dirty) => {
    setDirtyMap((m) => (Boolean(m[id]) === dirty ? m : { ...m, [id]: dirty }));
  }, []);
  const anyDirty = Object.values(dirtyMap).some(Boolean);

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= initialItems.length) return;
    const ids = initialItems.map((it) => it.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    startTransition(async () => {
      await reorderQuickAccessItems(ids);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <UnsavedChangesGuard when={anyDirty} />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-ds-xxl font-bold text-foreground">
            Quick Access cards
          </h1>
          <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
            Link cards shown in the home-page hero.
          </p>
        </div>
        <Button
          size="sm"
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              await createQuickAccessItem();
              router.refresh();
            })
          }
        >
          <Plus />
          Add card
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {initialItems.map((item, i) => (
          <QuickAccessCardEditor
            key={item.id}
            item={item}
            onDeleted={() => router.refresh()}
            onDirtyChange={reportDirty}
            onMoveUp={() => move(i, -1)}
            onMoveDown={() => move(i, 1)}
            isFirst={i === 0}
            isLast={i === initialItems.length - 1}
            reordering={isPending}
          />
        ))}
        {initialItems.length === 0 ? (
          <p className="rounded-lg border-2 border-dashed border-border p-8 text-center text-ds-xs font-medium text-muted-foreground">
            No Quick Access cards yet. Click &ldquo;Add card&rdquo; to create one.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function QuickAccessCardEditor({
  item,
  onDeleted,
  onDirtyChange,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  reordering,
}) {
  const [draft, setDraft] = useState({
    title: item.title ?? "",
    href: item.href ?? "",
    description: item.description ?? "",
    external: item.external ?? false,
  });
  const [status, setStatus] = useState("saved"); // saved | dirty | saving | error
  const [isPending, startTransition] = useTransition();

  // Report this card's unsaved state up to the editor (which renders the guard).
  // Clear it on unmount so a deleted card doesn't leave a stale "dirty" flag.
  const isDirty = status === "dirty";
  useEffect(() => {
    onDirtyChange(item.id, isDirty);
    return () => onDirtyChange(item.id, false);
  }, [item.id, isDirty, onDirtyChange]);

  const patch = (p) => {
    setDraft((d) => ({ ...d, ...p }));
    setStatus("dirty");
  };

  const save = () =>
    startTransition(async () => {
      setStatus("saving");
      try {
        await saveQuickAccessItem(item.id, draft);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });

  return (
    <Card>
      <div className="flex flex-col gap-4 px-4 xl:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Title"
            value={draft.title}
            onChange={(v) => patch({ title: v })}
            hint="Shown on the card."
          />
          <Field
            label="Link target"
            value={draft.href}
            onChange={(v) => patch({ href: v })}
            placeholder="/path or https://…"
            hint="/path for an internal page, https://… for an external site."
          />
          <Field
            className="sm:col-span-2"
            label="Description"
            value={draft.description}
            onChange={(v) => patch({ description: v })}
            textarea
            rows={2}
            hint="One line under the title. Optional."
          />
        </div>
        <div className="flex items-center justify-between border-t-2 border-border pt-3">
          <label className="flex items-center gap-2 text-ds-xs font-medium text-foreground">
            <Checkbox
              checked={draft.external}
              onCheckedChange={(c) => patch({ external: c === true })}
            />
            Opens in a new tab (external link)
          </label>
          <div className="flex items-center gap-3">
            <MoveControls
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              isFirst={isFirst}
              isLast={isLast}
              disabled={reordering}
            />
            <SaveState status={status} />
            <Button
              size="sm"
              onClick={save}
              disabled={status === "saved" || status === "saving" || isPending}
            >
              Save
            </Button>
            <DeleteButton
              onConfirm={() =>
                startTransition(async () => {
                  await deleteQuickAccessItem(item.id);
                  onDeleted();
                })
              }
            />
          </div>
        </div>
      </div>
    </Card>
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
