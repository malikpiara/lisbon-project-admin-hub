"use client";

import { iconOptions } from "@/lib/admin-default-data";
import { getServiceIcon, legacyIconToDsName } from "@/lib/service-icons";
import { cn } from "@/lib/utils";

// Visual icon picker over the DS iconography (same set + names as
// /components/icons). Services that still store a legacy lucide-era key
// highlight the DS tile with the identical glyph; picking writes the DS name.
// `options` narrows the set — the Quick Access cards have their own glyph
// family (lib/quick-access-icons.js) and must not offer the category icons.
export function IconPicker({ value, onChange, label, className = "", options = iconOptions }) {
  const current = legacyIconToDsName[value] ?? value;
  return (
    <div className={cn("block", className)}>
      {label ? (
        <span className="mb-1.5 block text-ds-xs font-medium text-foreground">
          {label}
        </span>
      ) : null}
      <div
        className={cn(
          "grid gap-2",
          options.length > 12 ? "grid-cols-8 sm:grid-cols-10" : "grid-flow-col auto-cols-[3rem] justify-start"
        )}
      >
        {options.map((key) => {
          const Icon = getServiceIcon(key);
          const selected = current === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              title={key}
              aria-label={key}
              aria-pressed={selected}
              className={cn(
                "grid aspect-square place-items-center rounded-lg border-2 outline-none transition-colors",
                "focus-visible:border-ring",
                selected
                  ? "border-primary bg-secondary text-primary"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
