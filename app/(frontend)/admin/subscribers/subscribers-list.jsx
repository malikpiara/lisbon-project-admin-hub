"use client";

import { useDeferredValue, useMemo, useState, ViewTransition } from "react";
import { Download, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Column set per source: MailerLite is the live list (with a subscribe status);
// the local fallback keeps the raw signup fields. `key` indexes the row object;
// `csv` picks the raw value the export writes (ISO date rather than the label).
const COLUMNS = {
  mailerlite: [
    { key: "email", label: "Email", strong: true },
    { key: "firstName", label: "Name", strong: true },
    { key: "status", label: "Status" },
    { key: "dateLabel", label: "Subscribed", csv: "dateISO" },
  ],
  local: [
    { key: "email", label: "Email", strong: true },
    { key: "firstName", label: "First name", strong: true },
    { key: "source", label: "Source" },
    { key: "dateLabel", label: "Signed up", csv: "dateISO" },
  ],
};

// Build a CSV from the rows. Values are RFC-4180 escaped: any field containing a
// comma, quote, or newline is wrapped in quotes with embedded quotes doubled.
function toCsv(rows, columns) {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.map((c) => c.label).map(esc).join(",")];
  for (const r of rows) {
    lines.push(columns.map((c) => esc(r[c.csv || c.key])).join(","));
  }
  return lines.join("\r\n");
}

const DESCRIPTION = {
  mailerlite: "Your newsletter list, synced live from MailerLite.",
  notConfigured:
    "Signups captured from the site footer. Connect MailerLite (set MAILERLITE_API_KEY) to sync new signups automatically — meanwhile they're stored here.",
  error: "Couldn’t reach MailerLite — showing the signups captured locally.",
};

export function SubscribersList({
  subscribers,
  total,
  source = "local",
  notConfigured = false,
  truncated = false,
  pendingLocal = 0,
}) {
  const [q, setQ] = useState("");
  // Filtering reads the deferred value so each change is a Transition — which is
  // what makes the list cross-fade via <ViewTransition> below. The input stays
  // bound to `q`, so typing is unaffected.
  const deferredQ = useDeferredValue(q);
  const columns = COLUMNS[source] ?? COLUMNS.local;

  const filtered = useMemo(() => {
    const needle = deferredQ.trim().toLowerCase();
    if (!needle) return subscribers;
    return subscribers.filter(
      (s) =>
        s.email.toLowerCase().includes(needle) ||
        (s.firstName || "").toLowerCase().includes(needle)
    );
  }, [deferredQ, subscribers]);

  function downloadCsv() {
    const csv = toCsv(filtered, columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `subscribers-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const description =
    source === "mailerlite"
      ? DESCRIPTION.mailerlite
      : notConfigured
        ? DESCRIPTION.notConfigured
        : DESCRIPTION.error;

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-ds-xxl font-bold text-foreground">
            Subscribers
          </h1>
          <p className="mt-1 max-w-prose text-ds-xs font-medium text-muted-foreground">
            {description}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={downloadCsv}
          disabled={filtered.length === 0}
        >
          <Download />
          Download CSV
        </Button>
      </header>

      {/* Leftover local signups that predate the MailerLite connection — they
          aren't in MailerLite yet, so flag them for a one-time import. */}
      {source === "mailerlite" && pendingLocal > 0 ? (
        <p className="mt-4 rounded-lg border-2 border-primary/30 bg-secondary/40 px-4 py-3 text-ds-xxs font-medium text-brand-dark">
          <span className="font-bold">
            {pendingLocal} earlier{" "}
            {pendingLocal === 1 ? "signup" : "signups"}
          </span>{" "}
          {pendingLocal === 1 ? "was" : "were"} captured locally before MailerLite
          was connected and {pendingLocal === 1 ? "isn’t" : "aren’t"} in MailerLite
          yet. Import {pendingLocal === 1 ? "it" : "them"} once, then this list is
          the single source of truth.
        </p>
      ) : null}

      {truncated ? (
        <p className="mt-4 text-ds-xxs font-medium text-muted-foreground">
          Showing the first 2,500 subscribers.
        </p>
      ) : null}

      <div className="relative mt-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by name or email…"
          className="pl-9"
        />
      </div>

      <p className="mt-4 text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground">
        {deferredQ.trim()
          ? `${filtered.length} of ${total} shown`
          : `${total} ${total === 1 ? "subscriber" : "subscribers"}`}
      </p>

      <ViewTransition>
        {filtered.length === 0 ? (
          <p className="mt-2 rounded-lg border-2 border-dashed border-border p-8 text-center text-ds-xs font-medium text-muted-foreground">
            {subscribers.length === 0
              ? "No subscribers yet. Newsletter signups will appear here."
              : `Nothing matches “${deferredQ}”.`}
          </p>
        ) : (
          <div className="mt-2 overflow-x-auto rounded-lg border-2 border-border">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-border bg-secondary/40">
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className="px-4 py-2.5 text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-secondary/30"
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={
                          c.strong
                            ? "px-4 py-2.5 text-ds-xs font-medium text-foreground"
                            : "px-4 py-2.5 text-ds-xs font-medium text-muted-foreground"
                        }
                      >
                        {s[c.key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ViewTransition>
    </div>
  );
}
