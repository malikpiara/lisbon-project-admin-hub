"use client";

import { ArrowDown, ArrowUp, ChevronRight, Copy } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DeleteButton } from "@/components/admin/delete-button";

// Compact ghost icon button for row actions (reorder / duplicate). Visible
// inline rather than hidden in a "⋮" popup like Payload — recognition over
// recall (Nielsen #6), and keyboard-accessible by default.
function RowAction({ icon: Icon, label, onClick, disabled }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
    >
      <Icon className="size-4" strokeWidth={2} />
    </button>
  );
}

// Reusable move-up / move-down pair for reordering list items.
export function MoveControls({ onMoveUp, onMoveDown, isFirst, isLast, disabled }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <RowAction
        icon={ArrowUp}
        label="Move up"
        onClick={onMoveUp}
        disabled={isFirst || disabled}
      />
      <RowAction
        icon={ArrowDown}
        label="Move down"
        onClick={onMoveDown}
        disabled={isLast || disabled}
      />
    </div>
  );
}

// A titled editor section with an optional count pill and right-aligned action.
export function Section({ title, count, description, action, children }) {
  return (
    <section className="mt-12 first:mt-0">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-heading text-ds-l font-bold text-foreground">
          {title}
          {typeof count === "number" ? (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-ds-xxs font-bold text-primary">
              {count}
            </span>
          ) : null}
        </h2>
        {action}
      </div>
      {description ? (
        <p className="mt-1 text-ds-xxs font-medium text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Collapsible row — a scannable summary that expands to its full fields.
export function EditorRow({
  title,
  subtitle,
  defaultOpen,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  isFirst,
  isLast,
  children,
}) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="overflow-hidden rounded-lg border-2 border-border bg-card"
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <CollapsibleTrigger className="group/row flex min-w-0 flex-1 items-center gap-3 text-left outline-none">
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]/row:rotate-90" />
          <span className="min-w-0">
            <span className="block truncate text-ds-xs font-bold text-foreground">
              {title}
            </span>
            {subtitle ? (
              <span className="block truncate text-ds-xxs font-medium text-muted-foreground">
                {subtitle}
              </span>
            ) : null}
          </span>
        </CollapsibleTrigger>
        <div className="flex shrink-0 items-center gap-0.5">
          {onMoveUp ? (
            <RowAction
              icon={ArrowUp}
              label="Move up"
              onClick={onMoveUp}
              disabled={isFirst}
            />
          ) : null}
          {onMoveDown ? (
            <RowAction
              icon={ArrowDown}
              label="Move down"
              onClick={onMoveDown}
              disabled={isLast}
            />
          ) : null}
          {onDuplicate ? (
            <RowAction icon={Copy} label="Duplicate" onClick={onDuplicate} />
          ) : null}
          {onDelete ? <DeleteButton onConfirm={onDelete} /> : null}
        </div>
      </div>
      <CollapsibleContent className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
        <div className="border-t-2 border-border p-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function EmptyState({ icon: Icon, label, hint }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-border px-6 py-10 text-center">
      {Icon ? (
        <Icon
          className="mx-auto mb-2 size-6 text-muted-foreground"
          strokeWidth={1.8}
        />
      ) : null}
      <p className="text-ds-xs font-bold text-foreground">{label}</p>
      {hint ? (
        <p className="mt-1 text-ds-xxs font-medium text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-8 py-10">
      <div className="h-3 w-28 rounded bg-muted" />
      <div className="mt-4 h-7 w-64 rounded bg-muted" />
      <div className="mt-10 space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
