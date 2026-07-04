import { cn } from "@/lib/utils";

// "Created / Last modified" metadata with a clear three-level hierarchy:
//   • label  — small, uppercase, muted (supporting, not competing)
//   • date   — the value, strong (foreground, bold)
//   • person — secondary (muted), set off from the date
// Mirrors the way /cms-admin organised this, but with who-did-it too.
function Stat({ label, item }) {
  if (!item) return null;
  return (
    <div className="min-w-0">
      <p className="text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate text-ds-xs font-bold text-foreground">
        {item.at}
        {item.by ? (
          <span className="font-medium text-muted-foreground"> · {item.by}</span>
        ) : null}
      </p>
    </div>
  );
}

export function AuditMeta({ audit, className = "" }) {
  if (!audit || (!audit.modified && !audit.created)) return null;
  return (
    <div className={cn("flex flex-wrap gap-x-12 gap-y-3", className)}>
      <Stat label="Created" item={audit.created} />
      <Stat label="Last modified" item={audit.modified} />
    </div>
  );
}
