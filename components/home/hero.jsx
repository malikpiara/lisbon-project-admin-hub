import Image from "next/image";
import { QuickAccess } from "@/components/home/quick-access";

function HeroIllustration() {
  // Faint DS hero decoration (document + search), exported from Figma.
  return (
    <Image
      src="/illustrations/hero-home.svg"
      alt=""
      aria-hidden="true"
      width={800}
      height={800}
      className="pointer-events-none absolute right-4 top-6 -z-10 hidden w-[min(46vw,800px)] max-w-[800px] 2xl:block"
    />
  );
}

export function Hero() {
  return (
    <section className="bg-bg-page">
      <div className="mx-auto max-w-[1680px] px-4 pb-8 pt-6 sm:px-6 lg:px-14 lg:pt-10">
        <div className="ds-section-padding relative isolate flex flex-col gap-12 overflow-hidden rounded-none xl:rounded-[3.5rem]">
          <HeroIllustration />
          <div className="max-w-[760px]">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <div
                aria-hidden
                className="grid size-28 shrink-0 place-items-center rounded-[2rem] bg-primary/[0.08]"
              >
                <Image
                  src="/illustrations/hero-home-icon.svg"
                  alt=""
                  width={80}
                  height={80}
                  className="size-20"
                />
              </div>
              <h1 className="font-heading text-ds-xxxxl font-bold text-primary">
                Admin Hub
              </h1>
            </div>
            <p className="mt-8 max-w-2xl text-ds-l font-bold text-foreground">
              Connecting community members to external services and internal
              resources.
            </p>
            <p className="mt-4 max-w-2xl text-ds-s font-medium text-foreground">
              Information platform summarizing the most common administrative
              processes, sharing tips and mapping external services.
            </p>
          </div>
          <QuickAccess embedded />
        </div>
      </div>
    </section>
  );
}
