import {
  IconBus,
  IconInfo,
  IconMetro,
  IconPhone,
} from "@/components/icons/ds-icons";

const schedule = [
  { day: "Mon, Tue, Thu", hours: "10:00–12:30 & 14:00–17:30" },
  { day: "Wednesday (Extended)", hours: "Until 19:30" },
  { day: "Friday", hours: "Until 18:30" },
];

const MAP_QUERY = "Rua Carvalho Araújo 66B, 1900-140 Lisboa, Portugal";

export function MapVisit() {
  return (
    <section className="bg-bg-page">
      <div className="relative overflow-hidden">
        <iframe
          title="Lisbon Project Association location"
          src={`https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=14&output=embed`}
          loading="lazy"
          className="h-[520px] w-full border-0"
          referrerPolicy="no-referrer-when-downgrade"
        />

        <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-14">
          <div className="relative -mt-32 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-10 rounded-lg border-2 border-border bg-card px-6 py-10 sm:px-10 lg:px-14 lg:py-14 min-[1680px]:gap-[88px]">
            {/* Where we are */}
            <div>
              <h3 className="font-heading text-ds-xl font-bold text-foreground">
                Where we are
              </h3>
              <address className="mt-4 text-ds-m font-medium not-italic text-brand-dark">
                {/* Opens the address in Google Maps (native map app on mobile).
                    Inherits the address styling so the default state matches
                    Figma exactly — the only change is a hover affordance. */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    MAP_QUERY
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open our address in Google Maps"
                  className="transition-colors hover:text-primary hover:underline"
                >
                  Rua Carvalho Araújo 66-B
                  <br />
                  1900-140 Lisboa
                  <br />
                  Portugal
                </a>
              </address>
              <p className="mt-5 text-ds-s font-bold text-brand-dark">How to Get Here</p>
              <ul className="mt-2 space-y-2 text-ds-xs font-medium text-brand-dark">
                <li className="flex items-center gap-2">
                  <IconMetro className="size-4 shrink-0" />
                  Metro: Linha Verde (Green Line) - Intendente Station
                </li>
                <li className="flex items-center gap-2">
                  <IconBus className="size-4 shrink-0" />
                  Bus: 708, 730, 742, 794
                </li>
              </ul>
            </div>

            {/* Opening hours */}
            <div>
              <h3 className="font-heading text-ds-xl font-bold text-foreground">
                Opening hours
              </h3>
              <dl className="mt-4 divide-y-2 divide-border">
                {schedule.map((row) => (
                  <div
                    key={row.day}
                    className="flex flex-wrap items-center justify-between gap-4 py-3.5 text-ds-xxs"
                  >
                    <dt className="font-semibold text-foreground">{row.day}</dt>
                    <dd className="font-medium text-foreground">{row.hours}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-ds-xxs font-bold text-foreground">
                <IconInfo className="size-4 shrink-0 text-primary" />
                No appointment needed. Just walk in.
              </div>
            </div>

            {/* Contact info */}
            <div>
              <h3 className="font-heading text-ds-xl font-bold text-foreground">
                Contact info
              </h3>
              <a
                href="tel:+351964809959"
                className="mt-4 flex items-center gap-2 text-ds-s font-bold text-brand-link hover:underline"
              >
                <IconPhone className="size-4 shrink-0" />
                +351 964 809 959
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="h-12" />
    </section>
  );
}
