import Image from "next/image";
import Link from "next/link";
import { serviceIconMap } from "@/lib/service-icons";

function HeroCircle() {
  // Faint DS service-hero decoration (people), exported from Figma.
  return (
    <Image
      src="/illustrations/hero-service.svg"
      alt=""
      aria-hidden="true"
      width={800}
      height={800}
      className="pointer-events-none absolute right-4 top-2 -z-10 hidden w-[min(46vw,800px)] max-w-[800px] 2xl:block"
    />
  );
}

/**
 * @param {{
 *   title: string;
 *   breadcrumb: string;
 *   intro?: string[];
 *   iconKey?: string;
 * }} props
 */
export function ServiceHero({ title, breadcrumb, intro = [], iconKey }) {
  const Icon = serviceIconMap[iconKey] ?? serviceIconMap.Building2;
  const [lead, ...rest] = intro;

  return (
    <section className="bg-bg-page">
      <div className="mx-auto max-w-[1680px] px-4 pb-8 pt-6 sm:px-6 lg:px-14 lg:pt-10">
        <nav
          aria-label="Breadcrumb"
          className="ds-section-x-padding pb-6 text-ds-xxs font-bold"
        >
          <Link
            href="/"
            className="text-primary underline underline-offset-[3px] hover:text-brand-link"
          >
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">{breadcrumb}</span>
        </nav>

        <div className="ds-section-padding relative isolate overflow-hidden rounded-none xl:rounded-[3.5rem]">
          <HeroCircle />
          <div className="max-w-[760px]">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div
                aria-hidden
                className="grid size-28 shrink-0 place-items-center rounded-[2rem] bg-primary/[0.08] text-primary"
              >
                <Icon className="size-20" strokeWidth={1.9} />
              </div>
              <h1 className="font-heading text-ds-xxxxl font-bold text-primary">
                {title}
              </h1>
            </div>
            {lead ? (
              <p className="mt-8 max-w-2xl text-ds-l font-bold text-foreground">
                {lead}
              </p>
            ) : null}
            {rest.length ? (
              <div className="mt-4 max-w-2xl space-y-3 text-ds-s font-medium text-foreground">
                {rest.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
