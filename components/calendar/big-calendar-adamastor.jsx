"use client";

import { useCallback, useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseEventDate } from "@/lib/google-calendar";
import { CATEGORIES, UNCATEGORISED, getCategory } from "@/lib/calendar-categories";
import { CategoryFilter } from "./category-filter";
import "./calendar-adamastor.css";

moment.updateLocale("en", {
  week: { dow: 1, doy: 4 },
});

const localizer = momentLocalizer(moment);

const formats = {
  timeGutterFormat: "h A",
  eventTimeRangeFormat: ({ start, end }, culture, l) =>
    `${l.format(start, "h A", culture)} - ${l.format(end, "h A", culture)}`,
  agendaTimeFormat: "h A",
  agendaTimeRangeFormat: ({ start, end }, culture, l) =>
    `${l.format(start, "h A", culture)} - ${l.format(end, "h A", culture)}`,
  dayFormat: "ddd DD",
  dayRangeHeaderFormat: ({ start, end }, culture, l) =>
    `${l.format(start, "MMMM DD", culture)} - ${l.format(end, "DD, YYYY", culture)}`,
  dayHeaderFormat: "dddd MMM DD",
};

export function BigCalendarAdamastor({ events }) {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [activeCategory, setActiveCategory] = useState("all");

  // Per-category counts drive the pill badges; only show the Uncategorised
  // pill when there's actually something untagged to surface and fix.
  const filterOptions = useMemo(() => {
    const counts = new Map();
    for (const e of events) counts.set(e.categoryId, (counts.get(e.categoryId) ?? 0) + 1);
    const options = CATEGORIES.map((c) => ({ ...c, count: counts.get(c.id) ?? 0 }));
    const uncategorised = counts.get(UNCATEGORISED.id) ?? 0;
    if (uncategorised > 0) options.push({ ...UNCATEGORISED, count: uncategorised });
    return options;
  }, [events]);

  const filteredEvents = useMemo(
    () => (activeCategory === "all" ? events : events.filter((e) => e.categoryId === activeCategory)),
    [events, activeCategory]
  );

  const rbcEvents = useMemo(
    () =>
      filteredEvents.map((e) => ({
        id: e.id,
        title: e.title,
        start: parseEventDate(e.start, e.allDay),
        end: parseEventDate(e.end, e.allDay),
        allDay: e.allDay,
        resource: e,
      })),
    [filteredEvents]
  );

  // Colour each event by category. Inline styles win over the CSS `.rbc-event`
  // defaults (class selectors), so a soft tint of the category hue replaces the
  // default teal without touching the stylesheet.
  const eventPropGetter = useCallback((event) => {
    const { color } = getCategory(event.resource?.categoryId);
    return {
      style: {
        backgroundColor: `${color}1F`,
        borderColor: `${color}59`,
        color,
      },
    };
  }, []);

  const CustomToolbar = useCallback(
    ({ label, onNavigate, onView }) => (
      <div className="flex items-center justify-between mb-5 mx-5 mt-5">
        <h2 className="text-lg font-medium text-[#104357] dark:text-[#E3F2F7] flex gap-2 items-center">
          <CalendarIcon /> {label}
        </h2>
        <section className="flex gap-2">
          <div className="flex items-center gap-1 border rounded-md">
            <button
              type="button"
              onClick={() => onNavigate("PREV")}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("TODAY")}
              className="px-3 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border-l border-r"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => onNavigate("NEXT")}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Select value={view} onValueChange={(v) => onView(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month View</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="agenda">Agenda</SelectItem>
            </SelectContent>
          </Select>
        </section>
      </div>
    ),
    [view]
  );

  const components = useMemo(() => ({ toolbar: CustomToolbar }), [CustomToolbar]);

  return (
    <div className="adamastor-calendar">
      <div className="mb-4 flex flex-col gap-2">
        <CategoryFilter
          options={filterOptions}
          activeId={activeCategory}
          onChange={setActiveCategory}
          totalCount={events.length}
        />
        <p className="text-sm text-muted-foreground">
          Showing {rbcEvents.length} {rbcEvents.length === 1 ? "event" : "events"}.
        </p>
      </div>
      <div style={{ height: "720px" }} className="bg-white dark:bg-background rounded-lg p-4">
        <Calendar
          localizer={localizer}
          events={rbcEvents}
          startAccessor="start"
          endAccessor="end"
          date={date}
          view={view}
          onNavigate={setDate}
          onView={setView}
          components={components}
          formats={formats}
          eventPropGetter={eventPropGetter}
          scrollToTime={new Date(1970, 0, 1, 8, 40)}
        />
      </div>
    </div>
  );
}
