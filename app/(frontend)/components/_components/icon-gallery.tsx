"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";

import { DS_ICON_NAMES } from "@/lib/ds-icons-data";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Icon reference: searchable, with click-to-copy of the <Icon /> snippet.
// Refines the old static grid — 81 icons need a filter and a real action,
// not a wall of truncated labels (recognition + efficiency).
export function IconGallery() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DS_ICON_NAMES;
    return DS_ICON_NAMES.filter((name) => name.toLowerCase().includes(q));
  }, [query]);

  async function copyName(name: string) {
    const snippet = `<Icon name="${name}" />`;
    let ok = false;
    try {
      await navigator.clipboard.writeText(snippet);
      ok = true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = snippet;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(name);
      setTimeout(() => setCopied((c) => (c === name ? null : c)), 1400);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search icons…"
            aria-label="Search icons"
            className="pl-11"
          />
        </div>
        <p className="text-ds-xs font-medium text-muted-foreground" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "icon" : "icons"}
          {query ? ` matching “${query}”` : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border px-6 py-12 text-center text-ds-xs font-medium text-muted-foreground">
          No icons match “{query}”. Try a different term.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {filtered.map((name) => {
            const isCopied = copied === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => copyName(name)}
                title={`Copy <Icon name="${name}" />`}
                aria-label={`Copy code for the ${name} icon`}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 bg-card p-3 text-center outline-none transition-colors",
                  isCopied
                    ? "border-primary text-primary"
                    : "border-border text-primary hover:border-foreground/30 focus-visible:border-ring"
                )}
              >
                <span className="grid size-7 place-items-center">
                  {isCopied ? (
                    <Check className="size-5" strokeWidth={2.5} />
                  ) : (
                    <Icon name={name} className="size-6" />
                  )}
                </span>
                <span
                  className="w-full truncate text-[0.7rem] font-medium text-muted-foreground"
                  title={name}
                >
                  {isCopied ? "Copied!" : name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
