"use client";

import { useDeferredValue, useMemo, useState, ViewTransition } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconNotes,
  IconPlus,
  IconSearch,
} from "@/components/icons/ds-icons";
import { Input } from "@/components/ui/input";
import { Tag } from "@/components/ui/tag";
import { EmptyState } from "@/components/admin/editor-ui";
import { SubmitButton } from "@/components/admin/submit-button";
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

  // New articles land under the first service; the editor lets the author
  // reassign. Only rendered when there's a service to attach one to.
  const addArticleForm = defaultServiceId ? (
    <form action={createTopic.bind(null, defaultServiceId)}>
      <SubmitButton size="sm" icon={IconPlus} pendingLabel="Adding…">
        Add article
      </SubmitButton>
    </form>
  ) : null;

  const hasArticles = topics.length > 0;

  return (
    <div className="mx-auto max-w-5xl px-8 pt-12 pb-28">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-ds-xxl font-bold text-foreground">
            Articles
          </h1>
          <p className="mt-2 max-w-2xl text-ds-xs font-medium leading-relaxed text-muted-foreground">
            {hasArticles
              ? `${topics.length} ${
                  topics.length === 1 ? "article" : "articles"
                } across all services.`
              : "Create the first one to get started."}
          </p>
        </div>
        {hasArticles ? addArticleForm : null}
      </header>

      {hasArticles ? (
        <>
          <div className="relative mt-8">
            <IconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
            <div className="mt-4 space-y-2.5">
              {filtered.map((t) => (
                <Link
                  key={t.id}
                  href={`/admin/articles/${t.id}`}
                  className="group flex items-center gap-4 rounded-lg border-2 border-border bg-card px-5 py-4 transition-colors hover:border-foreground/20"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-ds-xs font-bold text-foreground">
                      {t.title || "Untitled article"}
                    </span>
                    {t.description ? (
                      <span className="block truncate text-ds-xxs font-medium text-muted-foreground">
                        {t.description}
                      </span>
                    ) : null}
                  </span>
                  {/* Service as a scannable chip — read the whole list by
                      category at a glance instead of parsing a muted line. */}
                  {t.serviceTitle ? (
                    <Tag className="hidden shrink-0 md:inline-flex">
                      {t.serviceTitle}
                    </Tag>
                  ) : null}
                  <IconArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
              {filtered.length === 0 ? (
                <p className="rounded-lg border-2 border-dashed border-border p-10 text-center text-ds-xs font-medium text-muted-foreground">
                  No articles match &ldquo;{deferredQ}&rdquo;.
                </p>
              ) : null}
            </div>
          </ViewTransition>
        </>
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={IconNotes}
            label="No articles yet"
            hint="Articles are the guides shown on each service page. Create your first one — you can choose which service it belongs to while editing."
            action={addArticleForm}
          />
        </div>
      )}
    </div>
  );
}
