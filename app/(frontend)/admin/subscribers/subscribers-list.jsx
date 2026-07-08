"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Build a CSV from the rows. Values are RFC-4180 escaped: any field containing a
// comma, quote, or newline is wrapped in quotes with embedded quotes doubled.
function toCsv(rows) {
  const header = ["Email", "First name", "Source", "Signed up"];
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push([r.email, r.firstName, r.source, r.dateISO].map(esc).join(","));
  }
  return lines.join("\r\n");
}

export function SubscribersList({ subscribers, total }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return subscribers;
    return subscribers.filter(
      (s) =>
        s.email.toLowerCase().includes(needle) ||
        s.firstName.toLowerCase().includes(needle)
    );
  }, [q, subscribers]);

  function downloadCsv() {
    const csv = toCsv(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `subscribers-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-ds-xxl font-bold text-foreground">
            Subscribers
          </h1>
          <p className="mt-1 max-w-prose text-ds-xs font-medium text-muted-foreground">
            Newsletter signups captured from the site footer. Export this list to
            import into MailerLite.
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
        {q.trim()
          ? `${filtered.length} of ${total} shown`
          : `${total} ${total === 1 ? "subscriber" : "subscribers"}`}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-2 rounded-lg border-2 border-dashed border-border p-8 text-center text-ds-xs font-medium text-muted-foreground">
          {subscribers.length === 0
            ? "No signups yet. Footer newsletter signups will appear here."
            : `Nothing matches “${q}”.`}
        </p>
      ) : (
        <div className="mt-2 overflow-x-auto rounded-lg border-2 border-border">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-border bg-secondary/40">
                <th className="px-4 py-2.5 text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-2.5 text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground">
                  First name
                </th>
                <th className="px-4 py-2.5 text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground">
                  Source
                </th>
                <th className="px-4 py-2.5 text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground">
                  Signed up
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-border last:border-b-0 transition-colors hover:bg-secondary/30"
                >
                  <td className="px-4 py-2.5 text-ds-xs font-medium text-foreground">
                    {s.email}
                  </td>
                  <td className="px-4 py-2.5 text-ds-xs font-medium text-foreground">
                    {s.firstName || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-ds-xs font-medium text-muted-foreground">
                    {s.source || "—"}
                  </td>
                  <td className="px-4 py-2.5 text-ds-xs font-medium text-muted-foreground">
                    {s.dateLabel || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
