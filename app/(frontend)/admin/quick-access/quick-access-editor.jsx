"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconPlus } from "@/components/icons/ds-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, DirtyDot } from "@/components/admin/field";
import { DeleteButton } from "@/components/admin/delete-button";
import { MoveControls } from "@/components/admin/editor-ui";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";
import { SaveBar } from "@/components/admin/save-bar";
import { countChanges } from "@/lib/count-changes";
import { useFlip } from "@/lib/use-flip";
import {
  createQuickAccessItem,
  deleteQuickAccessItem,
  reorderQuickAccessItems,
  saveQuickAccessItem,
} from "./actions";

// Payload-backed Quick Access editor. Each card is a separate Payload document,
// but the save UX matches the single-document editors: one floating SaveBar that
// commits (or discards) every edited card AND the card order at once.
//
// Reorder is deferred (local order state, persisted on Save) rather than the old
// instant server-action + router.refresh — so rows can slide (FLIP), the moved
// card pulses + stays marked until saved, and reorders feed the change count.
export function QuickAccessEditor({ initialItems, userEmail }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [barPhase, setBarPhase] = useState("idle"); // idle | saving | error
  const flipRef = useFlip();

  const byId = Object.fromEntries(initialItems.map((it) => [it.id, it]));
  const serverIds = initialItems.map((it) => it.id);
  const serverKey = serverIds.join("|");

  // Local working order (rendered) vs the last-saved baseline. A card is "moved"
  // when its index differs from the baseline; orderDirty gates the bar/guard.
  const [order, setOrder] = useState(serverIds);
  const [savedOrder, setSavedOrder] = useState(serverIds);
  const [syncKey, setSyncKey] = useState(serverKey);
  const [flashId, setFlashId] = useState(null);
  // Remembered between an "Add card" click and the new card rendering, so the
  // sync block can flash it and the effect can scroll/focus it. State, not a ref,
  // because the render path reads it (reading a ref during render is disallowed).
  const [pendingNewId, setPendingNewId] = useState(null);

  // Re-sync to server membership when cards are added/deleted (those still
  // round-trip via router.refresh). The adjust-state-during-render pattern keeps
  // any pending local reorder of the cards that remain — and avoids an effect,
  // which would cascade renders here.
  if (syncKey !== serverKey) {
    setSyncKey(serverKey);
    setSavedOrder(serverIds);
    const kept = order.filter((id) => serverIds.includes(id));
    const added = serverIds.filter((id) => !kept.includes(id));
    setOrder([...kept, ...added]);
    // If this user just added a card, flash it via state (React-controlled, so a
    // mount-time re-render doesn't wipe the class) the moment it arrives.
    if (pendingNewId && added.includes(pendingNewId)) {
      setFlashId(pendingNewId);
    }
  }

  const orderDirty = order.join("|") !== savedOrder.join("|");
  const reorderedCount = order.reduce(
    (n, id, i) => n + (savedOrder.indexOf(id) !== i ? 1 : 0),
    0
  );

  // Aggregate each card's field-change count; add reordered cards for the total.
  const [countMap, setCountMap] = useState({});
  const reportCount = useCallback((id, count) => {
    setCountMap((m) => (m[id] === count ? m : { ...m, [id]: count }));
  }, []);
  const fieldCount = Object.values(countMap).reduce((a, b) => a + b, 0);
  const totalCount = fieldCount + reorderedCount;
  const anyDirty = fieldCount > 0 || orderDirty;

  // Registry of per-card save/discard/isDirty handles, keyed by id.
  const cardApis = useRef(new Map());
  const registerCard = useCallback((id, api) => {
    if (api) cardApis.current.set(id, api);
    else cardApis.current.delete(id);
  }, []);

  // "Add card" creates server-side at the bottom, then refreshes. Once the new
  // card renders we scroll it into view, flash it, and focus its title — without
  // this, non-technical editors click Add and see nothing happen (the new card
  // is off-screen below the fold).
  const addCard = () =>
    startTransition(async () => {
      const id = await createQuickAccessItem();
      setPendingNewId(id);
      router.refresh();
    });

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    const movedId = order[i];
    setOrder((prev) => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setFlashId(movedId);
    setTimeout(
      () => setFlashId((curr) => (curr === movedId ? null : curr)),
      700
    );
  };

  const saveAll = () =>
    startTransition(async () => {
      setBarPhase("saving");
      try {
        for (const api of cardApis.current.values()) {
          if (api.isDirty()) await api.save();
        }
        if (orderDirty) {
          await reorderQuickAccessItems(order);
          setSavedOrder(order);
        }
        setBarPhase("idle");
      } catch {
        setBarPhase("error");
      }
    });

  const discardAll = () => {
    for (const api of cardApis.current.values()) {
      if (api.isDirty()) api.discard();
    }
    setOrder(savedOrder);
    setBarPhase("idle");
  };

  // Reveal a just-added card: runs after the refresh re-renders with the new id.
  // Pure DOM (scroll/flash/focus) — no setState, so it won't cascade renders.
  useEffect(() => {
    if (pendingNewId == null) return;
    const el = document.querySelector(`[data-card-id="${pendingNewId}"]`);
    if (!el) return; // not rendered yet
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.querySelector("input")?.focus({ preventScroll: true });
    // Flash was set in render (sync block); clear it + the pending id after the
    // animation. setState in a timer (not synchronously in the effect body)
    // avoids the cascading-render lint rule.
    const t = setTimeout(() => {
      setFlashId((c) => (c === pendingNewId ? null : c));
      setPendingNewId(null);
    }, 700);
    return () => clearTimeout(t);
  }, [serverKey, pendingNewId]);

  return (
    <div className="mx-auto max-w-5xl px-8 pt-10 pb-28">
      <UnsavedChangesGuard when={anyDirty} />
      <SaveBar
        dirty={anyDirty}
        count={totalCount}
        saving={barPhase === "saving"}
        error={barPhase === "error"}
        onSave={saveAll}
        onDiscard={discardAll}
      />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-ds-xxl font-bold text-foreground">
            Quick Access cards
          </h1>
          <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
            Link cards shown in the home-page hero.
          </p>
        </div>
        {/* Disabled until cards support an icon + button label (the public hero
            renders both, hardcoded by id today). Re-enable by removing `disabled`
            once the icon picker + cta field land. addCard stays wired for then. */}
        <Button
          size="sm"
          disabled
          title="Adding cards is paused until they support an icon and button label"
          onClick={addCard}
        >
          <IconPlus />
          Add card
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {order.map((id, i) => {
          const item = byId[id];
          if (!item) return null;
          return (
            <div key={id} ref={flipRef(id)} data-card-id={id}>
              <QuickAccessCardEditor
                item={item}
                moved={savedOrder.indexOf(id) !== i}
                flashing={flashId === id}
                onDeleted={() => router.refresh()}
                onCountChange={reportCount}
                registerCard={registerCard}
                onMoveUp={() => move(i, -1)}
                onMoveDown={() => move(i, 1)}
                isFirst={i === 0}
                isLast={i === order.length - 1}
              />
            </div>
          );
        })}
        {order.length === 0 ? (
          <p className="rounded-lg border-2 border-dashed border-border p-8 text-center text-ds-xs font-medium text-muted-foreground">
            No Quick Access cards yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function QuickAccessCardEditor({
  item,
  moved,
  flashing,
  onDeleted,
  onCountChange,
  registerCard,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) {
  const [draft, setDraft] = useState(() => ({
    title: item.title ?? "",
    href: item.href ?? "",
    description: item.description ?? "",
    external: item.external ?? false,
  }));
  const [saved, setSaved] = useState(() => ({
    title: item.title ?? "",
    href: item.href ?? "",
    description: item.description ?? "",
    external: item.external ?? false,
  }));
  const [isPending, startTransition] = useTransition();

  // Honest diff: changeCount derived from draft-vs-snapshot. fieldDirty drives the
  // per-field wash; changeCount feeds the page's aggregate "N unsaved changes".
  const changeCount = countChanges(draft, saved);
  const fieldDirty = (a, b) => (a ?? "") !== (b ?? "");

  // Report this card's change count up to the page (which renders the guard/bar).
  useEffect(() => {
    onCountChange(item.id, changeCount);
    return () => onCountChange(item.id, 0);
  }, [item.id, changeCount, onCountChange]);

  // Expose save/discard/isDirty to the page's shared SaveBar.
  useEffect(() => {
    registerCard(item.id, {
      isDirty: () => JSON.stringify(draft) !== JSON.stringify(saved),
      save: async () => {
        const snapshot = draft;
        await saveQuickAccessItem(item.id, snapshot);
        setSaved(snapshot); // advance the baseline so dirty clears
      },
      discard: () => setDraft(saved),
    });
    return () => registerCard(item.id, null);
  }, [item.id, draft, saved, registerCard]);

  const patch = (p) => setDraft((d) => ({ ...d, ...p }));

  return (
    <Card
      className={cn(
        moved && "border-brand-300 bg-muted",
        flashing && "reorder-flash"
      )}
    >
      <div className="flex flex-col gap-4 px-4 xl:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Title"
            value={draft.title}
            onChange={(v) => patch({ title: v })}
            dirty={fieldDirty(draft.title, saved.title)}
            hint="Shown on the card."
          />
          <Field
            label="Link target"
            value={draft.href}
            onChange={(v) => patch({ href: v })}
            dirty={fieldDirty(draft.href, saved.href)}
            placeholder="/path or https://…"
            hint="/path for an internal page, https://… for an external site."
          />
          <Field
            className="sm:col-span-2"
            label="Description"
            value={draft.description}
            onChange={(v) => patch({ description: v })}
            dirty={fieldDirty(draft.description, saved.description)}
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
            {fieldDirty(draft.external, saved.external) ? <DirtyDot /> : null}
          </label>
          <div className="flex items-center gap-3">
            {moved ? (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-ds-xxs font-bold text-primary">
                Moved
              </span>
            ) : null}
            <MoveControls
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              isFirst={isFirst}
              isLast={isLast}
            />
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
