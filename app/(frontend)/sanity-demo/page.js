import Link from "next/link";

import { client } from "@/sanity/lib/client";
import { isSanityConfigured } from "@/sanity/env";
import { servicesQuery } from "@/sanity/lib/queries";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sanity demo · Lisbon Project" };

// Proof-of-life page: reads service content straight from Sanity in a Server
// Component, so it demonstrates the full round-trip (Studio -> Content Lake ->
// GROQ -> RSC). It is intentionally separate from the real public site, which
// still renders from the localStorage store.
export default async function SanityDemoPage() {
  if (!isSanityConfigured) {
    return <SetupNotice />;
  }

  let services = null;
  let error = null;
  try {
    services = await client.fetch(servicesQuery);
  } catch (err) {
    error = err?.message ?? String(err);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Header />
      {error ? (
        <p className="rounded-lg border-2 border-destructive/40 bg-destructive/5 p-4 text-ds-s text-destructive">
          Could not reach Sanity: {error}
        </p>
      ) : services?.length ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {services.map((s) => (
            <li
              key={s._id}
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
                {s.topics?.length ?? 0} topics · {s.contacts?.length ?? 0}{" "}
                contacts
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border-2 border-border bg-secondary p-4 text-ds-s">
          Connected to Sanity, but no <code>service</code> documents found yet.
          Run the seed (<code>pnpm seed:sanity</code>) or add content in the{" "}
          <Link className="underline" href="/studio">
            Studio
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
        Live from Sanity
      </p>
      <h1 className="mt-1 font-heading text-ds-xl font-bold text-brand-dark">
        Sanity content demo
      </h1>
      <p className="mt-2 max-w-2xl text-ds-s text-muted-foreground">
        Server-rendered from the Sanity Content Lake via GROQ. Edit content in
        the{" "}
        <Link className="underline" href="/studio">
          Studio
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
        Sanity is not configured yet
      </h1>
      <p className="mt-3 text-ds-s text-muted-foreground">
        Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> (and
        <code> NEXT_PUBLIC_SANITY_DATASET</code>) in <code>.env.local</code>,
        then restart the dev server. See{" "}
        <code>docs/CMS-EVALUATION.md</code> for the full setup.
      </p>
    </main>
  );
}
