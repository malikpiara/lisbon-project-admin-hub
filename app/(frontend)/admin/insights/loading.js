import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Route-level Suspense fallback. The page renders server-side and blocks on the
// PostHog Query API, so without this the team stares at a blank screen for a
// beat. This mirrors the real layout (hero + "Supporting signals" group) so the
// swap to live content is a settle, not a jump.

/** @param {{ className?: string }} props */
function Line({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

/** @param {{ rows?: number }} props */
function CardSkeleton({ rows = 4 }) {
  return (
    <Card>
      <CardHeader>
        <Line className="h-5 w-2/3" />
        <Line className="mt-2 h-3 w-2/5" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Line className="h-4 w-1/3" />
            <Line className="h-4 w-10" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function Loading() {
  return (
    <main
      className="mx-auto max-w-5xl px-8 py-10"
      aria-busy="true"
      aria-label="Loading insights"
    >
      <header className="mb-10">
        <Line className="h-8 w-40" />
        <Line className="mt-3 h-4 w-80 max-w-full" />
      </header>

      {/* Hero */}
      <CardSkeleton rows={5} />

      {/* Supporting signals */}
      <section className="mt-12">
        <Line className="mb-4 h-3 w-32" />
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
          <CardSkeleton rows={4} />
          <CardSkeleton rows={2} />
        </div>
        <div className="mt-8">
          <CardSkeleton rows={5} />
        </div>
      </section>
    </main>
  );
}
