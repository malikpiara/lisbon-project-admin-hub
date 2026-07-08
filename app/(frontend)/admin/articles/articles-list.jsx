"use client";

import { useDeferredValue, useMemo, useState, ViewTransition } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createTopic } from "./actions";

// Searchable Articles list — the teardown's "manage-at-scale" lesson: 140
// articles as cards is a scroll-wall, so filter by title / service / description.
export function ArticlesList({ topics, defaultServiceId = null }) {
  const [q, setQ] = useState("");
  // Filtering reads the deferred value so each change is a Transition — which is
  // what makes the list cross-fade via <ViewTransition> below. The input stays
  // bound to `q`, so typing is unaffected.
  const deferredQ = useDeferredValue(q);

  const filtered = useMemo(() => {
    const needle = deferredQ.trim().toLowerCase();
    if (!needle) return topics;
    return topics.filter(
      (t) =>
        t.title.toLowerCase().includes(needle) ||
        t.serviceTitle.toLowerCase().includes(needle) ||
        t.description.toLowerCase().includes(needle)
    );
  }, [deferredQ, topics]);

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-ds-xxl font-bold text-foreground">
            Articles
          </h1>
          <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
            {topics.length} articles across all services.
          </p>
        </div>
        {/* New articles land under the first service; the editor lets the author
            reassign. Hidden only if there are no services to attach one to. */}
        {defaultServiceId ? (
          <form action={createTopic.bind(null, defaultServiceId)}>
            <Button size="sm" type="submit">
              <Plus className="size-3.5" />
              Add article
            </Button>
          </form>
        ) : null}
      </header>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, service, or description…"
          className="pl-9"
        />
      </div>

      <p className="mt-3 text-ds-xxs font-medium text-muted-foreground">
        {filtered.length} of {topics.length} shown
      </p>

      <ViewTransition>
        <div className="mt-3 space-y-2">
        {filtered.map((t) => (
          <Link
            key={t.id}
            href={`/admin/articles/${t.id}`}
            className="group flex items-center gap-3 rounded-lg border-2 border-border bg-card px-4 py-3 transition-colors hover:border-foreground/20"
          >
            <span className="min-w-0">
              <span className="block truncate text-ds-xs font-bold text-foreground">
                {t.title || "Untitled article"}
              </span>
              <span className="block truncate text-ds-xxs font-medium text-muted-foreground">
                {t.serviceTitle}
                {t.description ? ` · ${t.description}` : ""}
              </span>
            </span>
            <ChevronRight className="ml-auto size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
        {filtered.length === 0 ? (
          <p className="rounded-lg border-2 border-dashed border-border p-8 text-center text-ds-xs font-medium text-muted-foreground">
            No articles match &ldquo;{deferredQ}&rdquo;.
          </p>
        ) : null}
        </div>
      </ViewTransition>
    </div>
  );
}
