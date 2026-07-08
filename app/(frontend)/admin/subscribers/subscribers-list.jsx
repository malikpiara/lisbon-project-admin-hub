"use client";

import { useMemo, useState } from "react";
import { Download, ExternalLink, Search } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// MailerLite's own dashboard is where the full subscriber list is managed — we
// link out rather than mirror thousands of real emails into this app.
const MAILERLITE_URL = "https://dashboard.mailerlite.com/subscribers";

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

export function SubscribersList({
  localSignups,
  localTotal,
  mailerliteConnected,
}) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return localSignups;
    return localSignups.filter(
      (s) =>
        s.email.toLowerCase().includes(needle) ||
        s.firstName.toLowerCase().includes(needle)
    );
  }, [q, localSignups]);

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
      <header>
        <h1 className="font-heading text-ds-xxl font-bold text-foreground">
          Subscribers
        </h1>
        <p className="mt-1 max-w-prose text-ds-xs font-medium text-muted-foreground">
          Where your newsletter audience lives, and any signups still waiting to
          be imported.
        </p>
      </header>

      {/* The list itself lives in MailerLite. We intentionally don't fetch or
          show it here — it's thousands of real subscribers' emails, and keeping
          that PII out of this app is the point. Link out instead. */}
      <section className="mt-6 rounded-lg border-2 border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-ds-s font-bold text-foreground">
              Newsletter list
            </h2>
            <p className="mt-1 max-w-prose text-ds-xs font-medium text-muted-foreground">
              {mailerliteConnected
                ? "Your subscribers are managed in MailerLite — new signups from the site are added there automatically. The full list isn’t shown here on purpose, to keep subscribers’ emails out of this app."
                : "MailerLite isn’t connected yet. Once MAILERLITE_API_KEY is set, new signups sync there automatically; until then they’re captured locally below."}
            </p>
          </div>
          {mailerliteConnected ? (
            <a
              href={MAILERLITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "sm" })}
            >
              Manage in MailerLite
              <ExternalLink className="size-4" />
            </a>
          ) : null}
        </div>
      </section>

      {/* The only subscriber data this app holds: signups captured before
          MailerLite was connected. Small, bounded, and meant to be drained. */}
      {localTotal > 0 ? (
        <section className="mt-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-ds-s font-bold text-foreground">
                Captured before MailerLite
              </h2>
              <p className="mt-1 max-w-prose text-ds-xxs font-medium text-muted-foreground">
                {localTotal === 1 ? "This signup was" : `These ${localTotal} signups were`}{" "}
                saved here before MailerLite was connected and{" "}
                {localTotal === 1 ? "isn’t" : "aren’t"} in it yet. Export{" "}
                {localTotal === 1 ? "it" : "them"}, import once into MailerLite,
                then {localTotal === 1 ? "it" : "they"} can be removed.
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
          </div>

          <div className="relative mt-4">
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
              ? `${filtered.length} of ${localTotal} shown`
              : `${localTotal} pending import`}
          </p>

          {filtered.length === 0 ? (
            <p className="mt-2 rounded-lg border-2 border-dashed border-border p-8 text-center text-ds-xs font-medium text-muted-foreground">
              {`Nothing matches “${q}”.`}
            </p>
          ) : (
            <div className="mt-2 overflow-x-auto rounded-lg border-2 border-border">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-border bg-secondary/40">
                    {["Email", "First name", "Source", "Signed up"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground"
                      >
                        {h}
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
        </section>
      ) : (
        <p className="mt-8 text-ds-xs font-medium text-muted-foreground">
          No local signups pending import — everything’s in MailerLite.
        </p>
      )}
    </div>
  );
}
