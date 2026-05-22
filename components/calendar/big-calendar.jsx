"use client";

import { useMemo, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enGB } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-GB": enGB };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

const VIEWS = [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA];

export function BigCalendar({ events }) {
  const [view, setView] = useState(Views.MONTH);
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

  return (
    <div className="h-[640px]">
      <Calendar
        localizer={localizer}
        events={rbcEvents}
        startAccessor="start"
        endAccessor="end"
        culture="en-GB"
        views={VIEWS}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        popup
      />
    </div>
  );
}

function parseEventDate(value, allDay) {
  if (value instanceof Date) return value;
  if (allDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(value);
}
