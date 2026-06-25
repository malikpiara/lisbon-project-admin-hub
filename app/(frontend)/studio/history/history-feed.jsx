"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FilePlus2, Pencil, Search, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ACTION = {
  created: { icon: FilePlus2, verb: "created", cls: "text-primary" },
  updated: { icon: Pencil, verb: "edited", cls: "text-brand-link" },
  deleted: { icon: Trash2, verb: "deleted", cls: "text-destructive" },
};

const TYPE_LABEL = {
  services: "category",
  topics: "topic",
  "quick-access": "quick access card",
  users: "team member",
};

function docHref(slug, id) {
  if (slug === "services") return `/studio/services/${id}`;
  if (slug === "topics") return `/studio/topics/${id}`;
  if (slug === "users") return "/studio/users";
  return "/studio/quick-access";
}

export function HistoryFeed({ entries }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter(
      (e) =>
        e.who.toLowerCase().includes(needle) ||
        e.docTitle.toLowerCase().includes(needle) ||
        (TYPE_LABEL[e.collectionSlug] || "").includes(needle) ||
        e.action.includes(needle)
    );
  }, [q, entries]);

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <header>
        <h1 className="font-heading text-ds-xxl font-bold text-foreground">
          History
        </h1>
        <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
          Every change made in the Studio — who, what, and when.
        </p>
      </header>

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by person, item, or action…"
          className="pl-9"
        />
      </div>

      <div className="mt-4 space-y-0.5">
        {filtered.map((e) => {
          const a = ACTION[e.action] ?? ACTION.updated;
          const Icon = a.icon;
          const type = TYPE_LABEL[e.collectionSlug] || e.collectionSlug;
          const row = (
            <div className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/40">
              <span
                className={cn(
                  "mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-secondary",
                  a.cls
                )}
              >
                <Icon className="size-4" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-ds-xs font-medium text-foreground">
                  <span className="font-bold">{e.who}</span> {a.verb} the {type}{" "}
                  <span className="font-bold">{e.docTitle}</span>
                </p>
                <p className="mt-0.5 text-ds-xxs font-medium text-muted-foreground">
                  {e.atLabel}
                </p>
              </div>
            </div>
          );
          return e.action !== "deleted" && e.docId ? (
            <Link
              key={e.id}
              href={docHref(e.collectionSlug, e.docId)}
              className="block rounded-lg outline-none focus-visible:bg-secondary/40"
            >
              {row}
            </Link>
          ) : (
            <div key={e.id}>{row}</div>
          );
        })}
        {filtered.length === 0 ? (
          <p className="rounded-lg border-2 border-dashed border-border p-8 text-center text-ds-xs font-medium text-muted-foreground">
            {entries.length === 0
              ? "No activity yet. Edits will appear here."
              : `Nothing matches “${q}”.`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
