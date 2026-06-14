"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { useAdmin } from "@/lib/admin-store";
import { cn } from "@/lib/utils";

// Makes the otherwise-silent autosave visible (Nielsen #1). Pulses the check
// each time the store persists to localStorage.
export function SaveStatus({ className = "" }) {
  const { savedAt, hydrated } = useAdmin();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!savedAt) return;
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 1000);
    return () => clearTimeout(t);
  }, [savedAt]);

  if (!hydrated) {
    return (
      <span className={cn("text-ds-xxs font-medium text-muted-foreground", className)}>
        Loading…
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-ds-xxs font-medium text-muted-foreground",
        className
      )}
    >
      <span
        className={cn(
          "grid size-4 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-300",
          pulse ? "scale-125" : "scale-100"
        )}
      >
        <Check className="size-2.5" strokeWidth={3.5} />
      </span>
      Saved locally
    </span>
  );
}
