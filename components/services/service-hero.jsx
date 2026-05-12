import Link from "next/link";

export function ServiceHero({ title, breadcrumb, intro }) {
  return (
    <section className="bg-bg-page">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground/80">{breadcrumb}</span>
        </nav>

        <div className="flex items-center gap-5">
          <div
            aria-hidden
            className="size-16 shrink-0 rounded-2xl bg-brand-yellow"
          />
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
        </div>

        <div className="mt-6 max-w-2xl space-y-3 text-base text-muted-foreground">
          {intro.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
