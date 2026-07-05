import { fetchUpcomingEvents, parseEventDate } from "@/lib/google-calendar";
import { getCategory } from "@/lib/calendar-categories";
import {
  BigCalendar,
  BigCalendarAdamastor,
} from "@/components/calendar/big-calendars-lazy";
import { CollapsibleSection } from "@/components/calendar/collapsible-section";

export const metadata = {
  title: "Events calendar",
  description:
    "Upcoming events, workshops and activities at the Lisbon Project for our community in Lisbon.",
  alternates: { canonical: "/calendar" },
};

export default async function CalendarPage() {
  let events = [];
  let error = null;

  try {
    events = await fetchUpcomingEvents({ maxResults: 30, daysAhead: 180 });
  } catch (err) {
    error = err.message;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl">
        <h1 className="mb-2 font-heading text-ds-xxxl font-bold text-brand-dark">
          Upcoming events
        </h1>
        <p className="mb-3 text-ds-xs font-medium text-muted-foreground">
          Read-only feed from a public Google Calendar via the Calendar API. The
          events below are being taken in real-time from a public google
          calendar. Events are sorted into categories by a title prefix —
          e.g. <span className="font-mono">&quot;Employability: AI Tools Workshop&quot;</span>{" "}
          shows under <span className="font-bold text-foreground">Employability</span> with the
          prefix hidden from the public title.
        </p>
        <p className="mb-8 text-ds-xs font-medium text-muted-foreground">
          The two calendars below are reference visuals for what an in-scope
          calendar could look like. Anything substantially different from one of
          these would likely push calendar work out of scope —
          react-big-calendar is the only realistic foundation, and meaningful
          deviation from these designs gets expensive fast.
        </p>

        {error && (
          <div className="mb-6 whitespace-pre-wrap rounded-lg border-2 border-destructive/40 bg-destructive/10 p-4 text-ds-xs font-medium text-destructive">
            {error}
          </div>
        )}

        {!error && events.length === 0 && (
          <p className="text-ds-xs font-medium text-muted-foreground">No upcoming events in the next 6 months.</p>
        )}
      </div>

      <ul className="mb-12 max-w-3xl divide-y-2 divide-border">
        {events.map((e) => (
          <li key={e.id} className="py-4">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="flex min-w-0 items-baseline gap-2 text-ds-s font-bold text-foreground">
                <span
                  className="h-2.5 w-2.5 shrink-0 translate-y-0.5 rounded-full"
                  style={{ backgroundColor: getCategory(e.categoryId).color }}
                  title={getCategory(e.categoryId).label}
                  aria-hidden="true"
                />
                {e.htmlLink ? (
                  <a href={e.htmlLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {e.title}
                  </a>
                ) : (
                  e.title
                )}
              </h2>
              <time className="shrink-0 text-ds-xxs font-medium text-muted-foreground">{formatRange(e)}</time>
            </div>
            {e.location && <p className="mt-1 text-ds-xxs font-medium text-muted-foreground">{e.location}</p>}
            {e.description && (
              <p className="mt-1 line-clamp-2 text-ds-xxs font-medium text-muted-foreground">{e.description}</p>
            )}
          </li>
        ))}
      </ul>

      {events.length > 0 && (
        <div className="max-w-5xl">
          <CollapsibleSection
            title="Calendar view — default styles"
            subtitle={
              <>
                Out-of-the-box{" "}
                <a
                  href="https://www.npmjs.com/package/react-big-calendar"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:opacity-80"
                >
                  react-big-calendar
                </a>
                {" "}— minimal effort, this is what you get by default.
              </>
            }
          >
            <BigCalendar events={events} />
          </CollapsibleSection>

          <CollapsibleSection
            title="Calendar view — Adamastor styles"
            subtitle={
              <>
                A personal redesign of the same component for my{" "}
                <a
                  href="https://adamastor.blog"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:opacity-80"
                >
                  Adamastor
                </a>
                {" "}project — illustrates what&apos;s achievable with focused effort.
              </>
            }
          >
            <BigCalendarAdamastor events={events} />
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}

function formatRange(e) {
  const start = parseEventDate(e.start, e.allDay);
  const end = parseEventDate(e.end, e.allDay);
  const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

  if (e.allDay) return dateFmt.format(start);
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) return `${dateFmt.format(start)} · ${timeFmt.format(start)}–${timeFmt.format(end)}`;
  return `${dateFmt.format(start)} → ${dateFmt.format(end)}`;
}
