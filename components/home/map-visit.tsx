import { Bus, Info, Phone, TramFront } from "lucide-react";

const schedule = [
  { day: "Mon - Tue - Thu", hours: "10:00–13:00 / 14:00–18:00" },
  { day: "Wednesday (Extended)", hours: "Until 19:30" },
  { day: "Friday", hours: "Until 18:30" },
];

const MAP_QUERY = "Rua Carvalho Araújo 66B, 1900-140 Lisboa, Portugal";

export function MapVisit() {
  return (
    <section className="bg-bg-page">
      <div className="relative">
        <iframe
          title="Lisbon Project Association location"
          src={`https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=14&output=embed`}
          loading="lazy"
          className="h-[440px] w-full border-0"
          referrerPolicy="no-referrer-when-downgrade"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-14">
          <div className="relative -mt-28 grid gap-10 rounded-3xl bg-card p-8 shadow-lg ring-1 ring-foreground/5 sm:p-10 lg:grid-cols-3">
            {/* Where we are */}
            <div>
              <h3 className="font-heading text-ds-l font-medium text-foreground">
                Where we are
              </h3>
              <address className="mt-4 text-base not-italic text-foreground">
                Rua Carvalho Araújo 66-B
                <br />
                1900-140 Lisboa
                <br />
                Portugal
              </address>
              <p className="mt-5 font-semibold text-foreground">How to Get Here</p>
              <ul className="mt-2 space-y-2 text-sm text-foreground">
                <li className="flex items-center gap-2">
                  <TramFront className="size-4 text-primary" />
                  Metro: Linha Verde (Green Line) - Intendente Station
                </li>
                <li className="flex items-center gap-2">
                  <Bus className="size-4 text-primary" />
                  Bus: 708, 730, 742, 794
                </li>
              </ul>
            </div>

            {/* Opening hours */}
            <div>
              <h3 className="font-heading text-ds-l font-medium text-foreground">
                Opening hours
              </h3>
              <dl className="mt-4 divide-y divide-border">
                {schedule.map((row) => (
                  <div
                    key={row.day}
                    className="flex items-center justify-between gap-4 py-3.5 text-sm"
                  >
                    <dt className="font-semibold text-foreground">{row.day}</dt>
                    <dd className="text-muted-foreground">{row.hours}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-foreground">
                <Info className="size-4 text-primary" />
                No appointment needed. Just walk in.
              </div>
            </div>

            {/* Contact info */}
            <div>
              <h3 className="font-heading text-ds-l font-medium text-foreground">
                Contact info
              </h3>
              <a
                href="tel:+351964809959"
                className="mt-4 flex items-center gap-2 text-primary hover:underline"
              >
                <Phone className="size-4" />
                +351 964 809 959
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="h-16" />
    </section>
  );
}
