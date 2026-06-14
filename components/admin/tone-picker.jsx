"use client";

import { Check } from "lucide-react";
import { toneOptions } from "@/lib/admin-default-data";
import { toneHex, toneLabel } from "@/lib/admin-tones";
import { cn } from "@/lib/utils";

// Visual colour picker — shows the actual tone colour instead of the word.
// Recognition over recall: the editor sees the colour they are choosing.
export function TonePicker({ value, onChange, label, className = "" }) {
  return (
    <div className={cn("block", className)}>
      {label ? (
        <span className="mb-1.5 block text-ds-xs font-medium text-foreground">
          {label}
        </span>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {toneOptions.map((tone) => {
          const selected = value === tone;
          return (
            <button
              key={tone}
              type="button"
              onClick={() => onChange(tone)}
              title={toneLabel(tone)}
              aria-label={toneLabel(tone)}
              aria-pressed={selected}
              className={cn(
                "grid size-8 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-card outline-none transition",
                "focus-visible:ring-foreground",
                selected ? "ring-foreground" : "ring-transparent hover:ring-border"
              )}
              style={{ backgroundColor: toneHex(tone) }}
            >
              {selected ? (
                <Check className="size-4 text-white" strokeWidth={3} />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
