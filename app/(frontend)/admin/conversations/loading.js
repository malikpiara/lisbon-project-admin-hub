import { Card, CardContent } from "@/components/ui/card";

// Route-level Suspense fallback for the transcripts view. Mirrors the collapsed
// inbox rows (title + meta + chevron) so the list settles into place when the
// PostHog Query API returns.

/** @param {{ className?: string }} props */
function Line({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <main
      className="mx-auto max-w-4xl px-6 py-16"
      aria-busy="true"
      aria-label="Loading conversations"
    >
      <header className="mb-8">
        <Line className="h-8 w-72 max-w-full" />
        <Line className="mt-3 h-4 w-96 max-w-full" />
        <Line className="mt-4 h-4 w-40" />
      </header>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <Line className="h-4 w-3/4" />
                <Line className="h-3 w-1/3" />
              </div>
              <Line className="size-4 shrink-0 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
