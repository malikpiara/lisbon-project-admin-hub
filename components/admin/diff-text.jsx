// Rendering for lib/diff-text word diffs, in DS colours: additions get the
// mint/teal treatment the admin already uses for "new" (bg-secondary +
// primary), deletions the destructive wash + strikethrough. Server-safe (no
// state) so review pages can render it directly.

import { cn } from "@/lib/utils";
import { diffStats } from "@/lib/diff-text";

// Inline run of diff ops. `mode` filters which sides show: "unified" shows
// both, "deletions"/"additions" show one side only (for split panels).
export function DiffText({ ops, mode = "unified", className }) {
  return (
    <span className={cn("whitespace-pre-wrap break-words", className)}>
      {ops.map((op, i) => {
        if (op.type === "equal") {
          return <span key={i}>{op.value}</span>;
        }
        if (op.type === "insert") {
          if (mode === "deletions") return null;
          return (
            <ins
              key={i}
              className="rounded bg-secondary px-0.5 text-primary no-underline"
            >
              {op.value}
            </ins>
          );
        }
        if (mode === "additions") return null;
        return (
          <del
            key={i}
            className="rounded bg-destructive/10 px-0.5 text-destructive line-through"
          >
            {op.value}
          </del>
        );
      })}
    </span>
  );
}

// "+12 added · −4 removed" — the at-a-glance size of a change.
export function DiffStatsLine({ ops, className }) {
  const stats = diffStats(ops);
  return (
    <span
      className={cn("text-ds-xxs font-bold whitespace-nowrap", className)}
    >
      <span className="text-primary">+{stats.additions} added</span>
      <span className="text-muted-foreground"> · </span>
      <span className="text-destructive">−{stats.deletions} removed</span>
    </span>
  );
}

// Side-by-side Before/After panels for long text, stacking on small screens.
export function SplitDiff({ ops, className }) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 divide-y-2 divide-border overflow-hidden rounded-lg border-2 border-border sm:grid-cols-2 sm:divide-x-2 sm:divide-y-0",
        className
      )}
    >
      <div className="min-w-0 px-4 py-3">
        <p className="mb-1.5 text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground">
          Before
        </p>
        <p className="text-ds-xs font-medium leading-relaxed text-foreground">
          <DiffText ops={ops} mode="deletions" />
        </p>
      </div>
      <div className="min-w-0 px-4 py-3">
        <p className="mb-1.5 text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground">
          After
        </p>
        <p className="text-ds-xs font-medium leading-relaxed text-foreground">
          <DiffText ops={ops} mode="additions" />
        </p>
      </div>
    </div>
  );
}
