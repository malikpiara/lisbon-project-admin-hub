import Link from "next/link";
import { getPayload } from "payload";

import config from "@payload-config";

export const dynamic = "force-dynamic";

export const metadata = { title: "Payload demo" };

// Proof-of-life page: reads service content straight from Payload's Local API
// (no HTTP hop) in a Server Component. It is intentionally separate from the
// real public site, which still renders from the localStorage store.
export default async function PayloadDemoPage() {
  if (!process.env.PAYLOAD_SECRET) {
    return <SetupNotice />;
  }

  let services = [];
  const topicCounts = {};
  let error = null;

  try {
    const payload = await getPayload({ config });
    const [svc, top] = await Promise.all([
      payload.find({ collection: "services", limit: 100, sort: "order", depth: 0 }),
      payload.find({ collection: "topics", limit: 1000, depth: 0 }),
    ]);
    services = svc.docs;
    for (const t of top.docs) {
      const sid =
        t.service && typeof t.service === "object" ? t.service.id : t.service;
      topicCounts[sid] = (topicCounts[sid] || 0) + 1;
    }
  } catch (err) {
    error = err?.message ?? String(err);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Header />
      {error ? (
        <p className="rounded-lg border-2 border-destructive/40 bg-destructive/5 p-4 text-ds-s text-destructive">
          Could not reach Payload: {error}
        </p>
      ) : services.length ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <li
              key={s.id}
              className="rounded-lg border-2 border-border bg-card p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-heading text-ds-m font-bold text-brand-dark">
                  {s.title}
                </h2>
                {s.tone ? (
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-ds-xs text-muted-foreground">
                    {s.tone}
                  </span>
                ) : null}
              </div>
              {s.shortDescription ? (
                <p className="mt-2 text-ds-s text-muted-foreground">
                  {s.shortDescription}
                </p>
              ) : null}
              <p className="mt-3 text-ds-xs text-muted-foreground">
                {topicCounts[s.id] ?? 0} topics · {s.contacts?.length ?? 0}{" "}
                contacts
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border-2 border-border bg-secondary p-4 text-ds-s">
          Connected to Payload, but no services found yet. Run{" "}
          <code>pnpm seed:payload</code> or add content in the{" "}
          <Link className="underline" href="/cms-admin">
            admin
          </Link>
          .
        </p>
      )}
    </main>
  );
}

function Header() {
  return (
    <header className="mb-8">
      <p className="text-ds-xs font-bold uppercase tracking-wide text-brand-link">
        Live from Payload
      </p>
      <h1 className="mt-1 font-heading text-ds-xl font-bold text-brand-dark">
        Payload content demo
      </h1>
      <p className="mt-2 max-w-2xl text-ds-s text-muted-foreground">
        Server-rendered through Payload&apos;s Local API (direct DB access, no
        HTTP). Edit content in the{" "}
        <Link className="underline" href="/cms-admin">
          admin
        </Link>{" "}
        and refresh.
      </p>
    </header>
  );
}

function SetupNotice() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-heading text-ds-xl font-bold text-brand-dark">
        Payload is not configured yet
      </h1>
      <p className="mt-3 text-ds-s text-muted-foreground">
        Set <code>PAYLOAD_SECRET</code> (and optionally <code>DATABASE_URI</code>
        ) in <code>.env.local</code>, run <code>pnpm seed:payload</code>, then
        restart the dev server. See <code>docs/CMS-EVALUATION.md</code>.
      </p>
    </main>
  );
}
