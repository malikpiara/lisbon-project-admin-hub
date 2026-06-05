import Link from "next/link";
import { getServiceIcon } from "@/lib/service-icons";

function HeroCircle() {
  // Faint DS service-hero decoration (people), exported from Figma.
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src="/illustrations/hero-service.svg"
      alt=""
      aria-hidden="true"
      className="ml-auto w-full max-w-[460px]"
    />
  );
}

export function ServiceHero({ title, breadcrumb, intro = [], iconKey }) {
  const Icon = getServiceIcon(iconKey);
  const [lead, ...rest] = intro;

  return (
    <section className="bg-bg-page">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-14 lg:pb-16">
        <nav aria-label="Breadcrumb" className="mb-10 text-ds-xs">
          <Link href="/" className="text-primary hover:underline">
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">{breadcrumb}</span>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <div className="flex items-center gap-5">
              <div
                aria-hidden
                className="grid size-28 shrink-0 place-items-center rounded-2xl bg-secondary text-primary"
              >
                <Icon className="size-20" />
              </div>
              <h1 className="font-heading text-ds-xxxxl font-medium tracking-tight text-primary">
                {title}
              </h1>
            </div>
            {lead ? (
              <p className="mt-8 max-w-2xl text-ds-xl font-semibold text-foreground">
                {lead}
              </p>
            ) : null}
            {rest.length ? (
              <div className="mt-4 max-w-2xl space-y-3 text-ds-s text-muted-foreground">
                {rest.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            ) : null}
          </div>

          <div className="hidden lg:block">
            <HeroCircle />
          </div>
        </div>
      </div>
    </section>
  );
}
