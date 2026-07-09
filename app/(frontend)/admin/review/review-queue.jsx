"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconCheck, IconNotes } from "@/components/icons/ds-icons";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DiffStatsLine, SplitDiff } from "@/components/admin/diff-text";
import { approveDraft, declineDraft } from "./actions";

export function ReviewQueue({ entries }) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header>
        <h1 className="font-heading text-ds-xxl font-bold text-foreground">
          Review
        </h1>
        <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
          Changes editors submitted. Approving publishes them; declining keeps
          the article as it is — nothing is lost either way.
        </p>
      </header>

      {entries.length === 0 ? (
        <div className="mt-8 rounded-lg border-2 border-dashed border-border p-10 text-center">
          <IconNotes className="mx-auto size-6 text-muted-foreground" />
          <p className="mt-2 text-ds-xs font-bold text-foreground">
            Nothing waiting for review
          </p>
          <p className="mt-1 text-ds-xxs font-medium text-muted-foreground">
            When an editor submits changes to an article, they show up here.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {entries.map((e) => (
            <ReviewCard key={e.id} entry={e} onDone={() => router.refresh()} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ entry, onDone }) {
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const act = (fn) =>
    startTransition(async () => {
      setError(null);
      const res = await fn(entry.id);
      if (res?.ok) onDone();
      else setError(res?.error || "Something went wrong. Try again.");
    });

  return (
    <Card>
      <div className="px-4 xl:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-ds-s font-bold text-foreground">{entry.title}</p>
            <p className="mt-0.5 text-ds-xxs font-medium text-muted-foreground">
              Submitted by <span className="font-bold">{entry.who}</span>
              {entry.at ? ` · ${entry.at}` : ""}
            </p>
          </div>
          <DiffStatsLine ops={entry.ops} className="mt-1" />
        </div>

        <div className="mt-3">
          <SplitDiff ops={entry.ops} />
        </div>

        {error ? (
          <p className="mt-2 text-ds-xxs font-medium text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => act(approveDraft)}
            disabled={isPending}
          >
            <IconCheck className="size-3.5" />
            {isPending ? "Working…" : "Approve & publish"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => act(declineDraft)}
            disabled={isPending}
          >
            Decline
          </Button>
          <Button
            size="sm"
            variant="ghost"
            nativeButton={false}
            render={<Link href={`/admin/articles/${entry.id}`} />}
          >
            Open in editor
          </Button>
        </div>
      </div>
    </Card>
  );
}
