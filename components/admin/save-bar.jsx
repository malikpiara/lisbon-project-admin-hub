"use client";

import { Button } from "@/components/ui/button";

// Floating action bar for single-document editors. Appears only when the draft
// differs from the last-saved snapshot (honest diff — not a one-way latch), so
// reverting an edit hides it again. Carries the two verbs that belong together:
// Save (primary) and Discard (secondary). It's the conventional home for "you
// have unsaved changes" and stays in view regardless of scroll depth.
//
// Placement note: the editor content needs bottom padding (pb-28) so the last
// section isn't covered when scrolled to the very bottom.
export function SaveBar({
  dirty,
  count = 0,
  saving = false,
  error = false,
  onSave,
  onDiscard,
}) {
  if (!dirty) return null;

  const label = error
    ? "Save failed — retry"
    : saving
      ? "Saving…"
      : count > 0
        ? `${count} unsaved ${count === 1 ? "change" : "changes"}`
        : "Unsaved changes";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 px-4 sm:px-8">
      <div className="pointer-events-auto mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-lg border-2 border-border bg-card px-5 py-3 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200">
        <span className="flex items-center gap-2 text-ds-xs font-medium">
          <span
            className={`size-1.5 rounded-full ${error ? "bg-destructive" : "bg-brand-link"}`}
            aria-hidden
          />
          <span className={error ? "text-destructive" : "text-foreground"}>
            {label}
          </span>
        </span>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-foreground"
            onClick={onDiscard}
            disabled={saving}
          >
            Discard
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
