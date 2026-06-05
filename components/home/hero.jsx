function HeroIllustration() {
  // Faint DS hero decoration (document + search), exported from Figma.
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src="/illustrations/hero-home.svg"
      alt=""
      aria-hidden="true"
      className="ml-auto w-full max-w-[460px]"
    />
  );
}

export function Hero() {
  return (
    <section className="bg-bg-page">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 lg:px-14 lg:pb-16 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <div className="flex items-center gap-5">
              <div
                aria-hidden
                className="grid size-28 shrink-0 place-items-center rounded-2xl bg-secondary"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/illustrations/hero-home-icon.svg" alt="" className="size-20" />
              </div>
              <h1 className="font-heading text-ds-xxxxl font-medium tracking-tight text-primary">
                Admin Hub
              </h1>
            </div>
            <p className="mt-8 max-w-2xl text-ds-xl font-semibold text-foreground">
              Connecting community members to external services and internal
              resources.
            </p>
            <p className="mt-4 max-w-2xl text-ds-s text-muted-foreground">
              Information platform summarizing the most common administrative
              processes, sharing tips and mapping external services.
            </p>
          </div>

          <div className="hidden lg:block">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
