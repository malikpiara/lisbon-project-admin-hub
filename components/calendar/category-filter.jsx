"use client";

// Horizontal row of category filter pills, à la the Adamastor "What's on" view.
// `options` are the category objects (id, label, color) plus a per-option count.
// `activeId === "all"` means no filter. Colours are runtime values from the
// category config, so they're applied as inline styles rather than utilities.

function hexAlpha(hex, alpha) {
  return `${hex}${alpha}`;
}

function Pill({ active, color, label, count, onClick, showDot = true }) {
  const style = active
    ? { backgroundColor: hexAlpha(color, "1A"), borderColor: hexAlpha(color, "66"), color }
    : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={style}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium",
        "transition-colors whitespace-nowrap",
        active
          ? "border-transparent"
          : "border-border bg-background text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800",
      ].join(" ")}
    >
      {showDot && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
      {typeof count === "number" && (
        <span className="text-xs opacity-60 tabular-nums">{count}</span>
      )}
    </button>
  );
}

export function CategoryFilter({ options, activeId, onChange, totalCount }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Pill
        active={activeId === "all"}
        color="#2563eb"
        label="All events"
        count={totalCount}
        showDot={false}
        onClick={() => onChange("all")}
      />
      {options.map((opt) => (
        <Pill
          key={opt.id}
          active={activeId === opt.id}
          color={opt.color}
          label={opt.label}
          count={opt.count}
          onClick={() => onChange(opt.id)}
        />
      ))}
    </div>
  );
}
