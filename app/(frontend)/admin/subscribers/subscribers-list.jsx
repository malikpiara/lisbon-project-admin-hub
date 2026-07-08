"use client";

import { useMemo, useState } from "react";
import { Download, ExternalLink, Search } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// MailerLite's own dashboard is where the full subscriber list is managed — we
// link out rather than mirror thousands of real emails into this app.
const MAILERLITE_URL = "https://dashboard.mailerlite.com/subscribers";

// Build a CSV from the local drain rows. Values are RFC-4180 escaped: any field
// containing a comma, quote, or newline is wrapped in quotes with embedded
// quotes doubled.
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

const thClass =
  "px-4 py-2.5 text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground";
const tdStrong = "px-4 py-2.5 text-ds-xs font-medium text-foreground";
const tdMuted = "px-4 py-2.5 text-ds-xs font-medium text-muted-foreground";

export function SubscribersList({
  mailerliteConnected,
  recent = [],
  recentTotal = null,
  recentScoped = false,
  recentFailed = false,
  localSignups = [],
  localTotal = 0,
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
          A recent snapshot of your newsletter audience. The full list lives in
          MailerLite.
        </p>
      </header>

      {/* The full list stays in MailerLite. Link out; don't mirror it here. */}
      <section className="mt-6 rounded-lg border-2 border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-ds-s font-bold text-foreground">
              Newsletter list
            </h2>
            <p className="mt-1 max-w-prose text-ds-xs font-medium text-muted-foreground">
              {mailerliteConnected
                ? "Your subscribers are managed in MailerLite — new signups from the site are added there automatically. Only a recent snapshot is shown here, with emails masked; open MailerLite to search or manage the full list."
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

      {/* Recent snapshot from MailerLite — masked, newest-first, bounded. */}
      {mailerliteConnected ? (
        <section className="mt-8">
          <h2 className="font-heading text-ds-s font-bold text-foreground">
            {recentScoped ? "Recent website signups" : "Recent subscribers"}
            {recentTotal != null ? (
              <span className="ml-2 text-ds-xs font-medium text-muted-foreground">
                {recentTotal.toLocaleString("en-GB")} total
              </span>
            ) : null}
          </h2>

          {!recentScoped ? (
            <p className="mt-2 rounded-lg border-2 border-primary/30 bg-secondary/40 px-4 py-3 text-ds-xxs font-medium text-brand-dark">
              These are the most recent additions across your{" "}
              <span className="font-bold">whole MailerLite account</span> (which
              includes donor lists), not only website signups. Set{" "}
              <span className="font-bold">MAILERLITE_GROUP_ID</span> to a dedicated
              group to scope this to site signups — and to show an accurate total.
            </p>
          ) : null}

          {recentFailed ? (
            <p className="mt-3 rounded-lg border-2 border-dashed border-border p-6 text-center text-ds-xs font-medium text-muted-foreground">
              Couldn’t load recent subscribers from MailerLite right now. Try
              again, or open MailerLite directly.
            </p>
          ) : recent.length === 0 ? (
            <p className="mt-3 rounded-lg border-2 border-dashed border-border p-6 text-center text-ds-xs font-medium text-muted-foreground">
              No subscribers found.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-lg border-2 border-border">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-border bg-secondary/40">
                    <th className={thClass}>Email</th>
                    <th className={thClass}>Name</th>
                    <th className={thClass}>Status</th>
                    <th className={thClass}>Subscribed</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-border last:border-b-0 transition-colors hover:bg-secondary/30"
                    >
                      <td className={tdStrong}>{s.emailMasked}</td>
                      <td className={tdStrong}>{s.firstName || "—"}</td>
                      <td className={tdMuted}>{s.status || "—"}</td>
                      <td className={tdMuted}>{s.dateLabel || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {/* Signups captured locally before MailerLite was connected — full emails
          (these still need importing), small, bounded, exportable, drainable. */}
      {localTotal > 0 ? (
        <section className="mt-10">
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
            {q.trim() ? `${filtered.length} of ${localTotal} shown` : `${localTotal} pending import`}
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
                      <th key={h} className={thClass}>
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
                      <td className={tdStrong}>{s.email}</td>
                      <td className={tdStrong}>{s.firstName || "—"}</td>
                      <td className={tdMuted}>{s.source || "—"}</td>
                      <td className={tdMuted}>{s.dateLabel || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
