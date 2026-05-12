import Link from "next/link";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function Hero() {
  return (
    <section className="bg-bg-page">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Home
          </Link>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div>
            <div className="flex items-center gap-5">
              <div
                aria-hidden
                className="size-16 shrink-0 rounded-2xl bg-brand-yellow"
              />
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Admin Hub
              </h1>
            </div>
            <p className="mt-6 max-w-xl text-base text-muted-foreground">
              Connecting community members to external services and internal
              resources.
            </p>
            <p className="mt-3 max-w-xl text-base text-muted-foreground">
              Information platform summarizing the most common administrative
              processes, sharing tips and mapping external services.
            </p>
          </div>

          <Card className="w-full max-w-[440px] gap-6 rounded-3xl border-2 border-primary/30 p-6 shadow-xl lg:justify-self-end">
            <CardHeader className="px-0">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="size-5 text-primary" />
                Quick search
              </CardTitle>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Search for administrative services, information, and support
                resources.
              </p>
            </CardHeader>
            <CardContent className="px-0">
              <div role="search" className="relative">
                <Search
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="search"
                  placeholder="Search services and information..."
                  aria-label="Search services and information"
                  className="h-11 pl-9"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
