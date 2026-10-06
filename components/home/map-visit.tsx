import {
  IconBus,
  IconInfo,
  IconMetro,
  IconPhone,
} from "@/components/icons/ds-icons";
import {
  SITE_TEXT_DEFAULTS,
  type HoursRow,
  type SiteText,
} from "@/lib/site-text-defaults";

// "Visit us" block: map + address/directions, opening hours, contact. All text
// comes from the site-text global (editable at /admin/site-text); `copy`
// defaults to the shipped text so bare renders (styleguide) look as before.
// Optional lines (metro, bus, the walk-in note, the hours list) hide when empty.
export function MapVisit({ copy = SITE_TEXT_DEFAULTS }: { copy?: SiteText }) {
  const street: string = copy.addressStreet;
  const postal: string = copy.addressPostalCode;
  const city: string = copy.addressLocality;
  const mapQuery = `${street}, ${postal} ${city}, Portugal`;
  const hours: HoursRow[] = copy.openingHours ?? [];
  const phone: string = copy.phone ?? "";

  return (
    <section className="bg-bg-page">
      <div className="relative overflow-hidden">
        <iframe
          title="Lisbon Project Association location"
          src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`}
          loading="lazy"
          className="h-[520px] w-full border-0"
          referrerPolicy="no-referrer-when-downgrade"
        />

        <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-14">
          <div className="relative -mt-32 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-10 rounded-lg border-2 border-border bg-card px-6 py-10 sm:px-10 lg:px-14 lg:py-14 min-[1680px]:gap-[88px]">
            {/* Where we are */}
            <div>
              <h3 className="font-heading text-ds-xl font-bold text-foreground">
                {copy.visitTitle}
              </h3>
              <address className="mt-4 text-ds-m font-medium not-italic text-brand-dark">
                {/* Opens the address in Google Maps (native map app on mobile).
                    Inherits the address styling so the default state matches
                    Figma exactly — the only change is a hover affordance. */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    mapQuery
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open our address in Google Maps"
                  className="transition-colors hover:text-primary hover:underline"
                >
                  {street}
                  <br />
                  {postal} {city}
                  <br />
                  Portugal
                </a>
              </address>
              {copy.metroLine?.trim() || copy.busLine?.trim() ? (
                <>
                  <p className="mt-5 text-ds-s font-bold text-brand-dark">
                    {copy.directionsTitle}
                  </p>
                  <ul className="mt-2 space-y-2 text-ds-xs font-medium text-brand-dark">
                    {copy.metroLine?.trim() ? (
                      <li className="flex items-center gap-2">
                        <IconMetro className="size-4 shrink-0" />
                        {copy.metroLine}
                      </li>
                    ) : null}
                    {copy.busLine?.trim() ? (
                      <li className="flex items-center gap-2">
                        <IconBus className="size-4 shrink-0" />
                        {copy.busLine}
                      </li>
                    ) : null}
                  </ul>
                </>
              ) : null}
            </div>

            {/* Opening hours */}
            <div>
              <h3 className="font-heading text-ds-xl font-bold text-foreground">
                {copy.hoursTitle}
              </h3>
              {hours.length ? (
                <dl className="mt-4 divide-y-2 divide-border">
                  {hours.map((row, i) => (
                    <div
                      key={`${row.day}-${i}`}
                      className="flex flex-wrap items-center justify-between gap-4 py-3.5 text-ds-xxs"
                    >
                      <dt className="font-semibold text-foreground">{row.day}</dt>
                      <dd className="font-medium text-foreground">{row.hours}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {copy.hoursNote?.trim() ? (
                <div className="mt-4 flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-ds-xxs font-bold text-foreground">
                  <IconInfo className="size-4 shrink-0 text-primary" />
                  {copy.hoursNote}
                </div>
              ) : null}
            </div>

            {/* Contact info */}
            <div>
              <h3 className="font-heading text-ds-xl font-bold text-foreground">
                {copy.contactTitle}
              </h3>
              {/* tel: keeps digits + leading + so it dials; the label stays as typed. */}
              <a
                href={`tel:${phone.replace(/[^\d+]/g, "")}`}
                className="mt-4 flex items-center gap-2 text-ds-s font-bold text-brand-link hover:underline"
              >
                <IconPhone className="size-4 shrink-0" />
                {phone}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="h-12" />
    </section>
  );
}
