"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";

import { DS_ICONS, DS_ICON_NAMES } from "@/lib/ds-icons-data";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// The DS draws icons at three sizes with different baked stroke weights —
// group the gallery the way the Figma library thinks about them.
const SIZE_FAMILIES = [
  {
    size: 16,
    title: "UI icons · 16px",
    description:
      "Chrome glyphs — arrows, search, menu, eyes, check, plus/minus. Drawn for small sizes.",
  },
  {
    size: 24,
    title: "Core icons · 24px",
    description:
      "The main set: services, programs, actions. Drawn at 24px with a 2.3px stroke.",
  },
  {
    size: 56,
    title: "Display icons · 56px",
    description:
      "Large decorative glyphs for cards and heroes (tip, heart-open, user-plus, internal-link).",
  },
] as const;

function iconSize(name: string): number {
  const match = DS_ICONS[name]?.match(/viewBox="0 0 (\d+) \d+"/);
  return match ? Number(match[1]) : 24;
}

// Icon reference: searchable, grouped by size family, click-to-copy of the
// <Icon /> snippet.
export function IconGallery() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DS_ICON_NAMES;
    return DS_ICON_NAMES.filter((name) => name.toLowerCase().includes(q));
  }, [query]);

  const families = useMemo(
    () =>
      SIZE_FAMILIES.map((family) => ({
        ...family,
        icons: filtered.filter((name) => iconSize(name) === family.size),
      })).filter((family) => family.icons.length > 0),
    [filtered]
  );

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
    <div className="space-y-8">
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

      {families.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-border px-6 py-12 text-center text-ds-xs font-medium text-muted-foreground">
          No icons match “{query}”. Try a different term.
        </div>
      ) : (
        families.map((family) => (
          <section key={family.size} className="space-y-3">
            <div>
              <h3 className="font-heading text-ds-s font-bold text-foreground">
                {family.title}
              </h3>
              <p className="mt-1 max-w-3xl text-ds-xxs font-medium text-muted-foreground">
                {family.description}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {family.icons.map((name) => {
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
          </section>
        ))
      )}
    </div>
  );
}
