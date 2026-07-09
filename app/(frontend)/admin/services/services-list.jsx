"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { IconArrowRight, IconPlus } from "@/components/icons/ds-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoveControls } from "@/components/admin/editor-ui";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";
import { SaveBar } from "@/components/admin/save-bar";
import { useFlip } from "@/lib/use-flip";
import { getServiceIcon, getServiceIconKey } from "@/lib/service-icons";
import { createService, reorderServices } from "./actions";

export function ServicesList({ services, userEmail }) {
  const [phase, setPhase] = useState("idle"); // idle | saving | error
  const [, startTransition] = useTransition();
  const flipRef = useFlip();

  const byId = Object.fromEntries(services.map((s) => [s.id, s]));
  const serverIds = services.map((s) => s.id);
  const serverKey = serverIds.join("|");

  // Deferred reorder: local working order (rendered), persisted on Save — so the
  // cards slide, the moved one pulses + stays marked, and the order isn't written
  // until the editor confirms. A card is "moved" when its index differs from the
  // last-saved baseline.
  const [order, setOrder] = useState(serverIds);
  const [savedOrder, setSavedOrder] = useState(serverIds);
  const [syncKey, setSyncKey] = useState(serverKey);
  const [flashId, setFlashId] = useState(null);

  // Re-sync to server membership on add/delete (adjust during render, preserving
  // any pending local reorder of the cards that remain).
  if (syncKey !== serverKey) {
    setSyncKey(serverKey);
    setSavedOrder(serverIds);
    setOrder((prev) => {
      const kept = prev.filter((id) => serverIds.includes(id));
      const added = serverIds.filter((id) => !kept.includes(id));
      return [...kept, ...added];
    });
  }

  const orderDirty = order.join("|") !== savedOrder.join("|");
  const reorderedCount = order.reduce(
    (n, id, i) => n + (savedOrder.indexOf(id) !== i ? 1 : 0),
    0
  );

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
    setTimeout(() => setFlashId((c) => (c === movedId ? null : c)), 700);
  };

  const save = () =>
    startTransition(async () => {
      setPhase("saving");
      try {
        await reorderServices(order);
        setSavedOrder(order);
        setPhase("idle");
      } catch {
        setPhase("error");
      }
    });

  const discard = () => {
    setOrder(savedOrder);
    setPhase("idle");
  };

  return (
    <div className="mx-auto max-w-5xl px-8 pt-10 pb-28">
      <UnsavedChangesGuard when={orderDirty} />
      <SaveBar
        dirty={orderDirty}
        count={reorderedCount}
        saving={phase === "saving"}
        error={phase === "error"}
        onSave={save}
        onDiscard={discard}
      />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-ds-xxl font-bold text-foreground">
            Services &amp; Information
          </h1>
          <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
            {order.length} categories, in the order they appear on the home page.
          </p>
        </div>
        <form action={createService}>
          <Button size="sm" type="submit">
            <IconPlus />
            Add category
          </Button>
        </form>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {order.map((id, i) => {
          const service = byId[id];
          if (!service) return null;
          const Icon = getServiceIcon(
            getServiceIconKey(service.slug, service.iconKey)
          );
          const moved = savedOrder.indexOf(id) !== i;
          return (
            <Card
              key={id}
              ref={flipRef(id)}
              className={cn(
                "h-full",
                moved && "border-brand-300 bg-muted",
                flashId === id && "reorder-flash"
              )}
            >
              <Link
                href={`/admin/services/${service.id}`}
                className="group flex flex-1 items-start gap-4 px-4 outline-none xl:px-6"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <Icon className="size-5" strokeWidth={1.9} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-heading text-ds-s font-bold text-foreground">
                    {service.title}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-ds-xs font-medium text-muted-foreground">
                    {service.shortDescription || "No short description"}
                  </p>
                  <p className="mt-3 text-ds-xxs font-medium text-muted-foreground">
                    {service.topicCount} topic{service.topicCount === 1 ? "" : "s"}{" "}
                    · {service.contactCount} contact
                    {service.contactCount === 1 ? "" : "s"}
                  </p>
                </div>
                <IconArrowRight className="mt-1 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
              </Link>
              <div className="flex items-center justify-between px-4 xl:px-6">
                <span className="text-ds-xxs font-bold text-muted-foreground">
                  #{i + 1}
                </span>
                <div className="flex items-center gap-3">
                  {moved ? (
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-ds-xxs font-bold text-primary">
                      Moved
                    </span>
                  ) : null}
                  <MoveControls
                    onMoveUp={() => move(i, -1)}
                    onMoveDown={() => move(i, 1)}
                    isFirst={i === 0}
                    isLast={i === order.length - 1}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
