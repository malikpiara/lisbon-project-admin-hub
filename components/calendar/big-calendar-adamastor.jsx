"use client";

import { useCallback, useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseEventDate } from "@/lib/google-calendar";
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

  const rbcEvents = useMemo(
    () =>
      events.map((e) => ({
        id: e.id,
        title: e.title,
        start: parseEventDate(e.start, e.allDay),
        end: parseEventDate(e.end, e.allDay),
        allDay: e.allDay,
        resource: e,
      })),
    [events]
  );

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
          scrollToTime={new Date(1970, 0, 1, 8, 40)}
        />
      </div>
    </div>
  );
}
