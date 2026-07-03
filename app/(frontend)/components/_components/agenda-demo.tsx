"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

type Category = { key: string; label: string; color: string };

// Program-area colors (Figma projects/*).
const CATEGORIES: Category[] = [
  { key: "community-life", label: "Community Life", color: "#DA2916" },
  { key: "people-culture", label: "People & Culture", color: "#B530B5" },
  { key: "education", label: "Education", color: "#443FD9" },
  { key: "employability", label: "Employability", color: "#006DBD" },
  { key: "social-care", label: "Social Care", color: "#CC6300" },
];
const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

type AgendaEvent = { date: Date; title: string; cat: string; time: string };
const EVENTS: AgendaEvent[] = [
  { date: new Date(2026, 5, 11), title: "Bridge Team Hours", cat: "community-life", time: "10:00–12:30" },
  { date: new Date(2026, 5, 11), title: "Portuguese Course", cat: "education", time: "14:00–16:00" },
  { date: new Date(2026, 5, 13), title: "Community Dinner", cat: "community-life", time: "18:30" },
  { date: new Date(2026, 5, 18), title: "Job Search Workshop", cat: "employability", time: "11:00" },
  { date: new Date(2026, 5, 22), title: "Family Friday", cat: "people-culture", time: "16:00" },
  { date: new Date(2026, 5, 27), title: "Youth Explore", cat: "education", time: "15:00" },
  { date: new Date(2026, 5, 18), title: "Family Support Drop-in", cat: "social-care", time: "09:30" },
];

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

export function AgendaDemo() {
  const [active, setActive] = React.useState<Set<string>>(new Set());
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 5, 11));

  const visible = EVENTS.filter((e) => active.size === 0 || active.has(e.cat));
  const eventDays = visible.map((e) => e.date);
  const dayEvents = date ? visible.filter((e) => sameDay(e.date, date)) : [];

  const toggle = (k: string) =>
    setActive((prev) => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      return next;
    });

  return (
    // Own gutter: this demo renders full-width in the docs preview frame,
    // which provides no inner padding of its own.
    <div className="flex flex-col gap-6 p-8">
      {/* Filter chips */}
      <div className="space-y-2">
        <p className="text-ds-xs font-bold text-foreground">Filter by Project</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActive(new Set())}
            className={cn(
              "inline-flex h-8 items-center rounded-lg border-2 px-3 text-ds-xxs font-bold transition-colors",
              active.size === 0
                ? "border-primary bg-secondary text-primary"
                : "border-border bg-card text-foreground hover:bg-secondary"
            )}
          >
            All Projects
          </button>
        {CATEGORIES.map((c) => {
          const on = active.has(c.key);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => toggle(c.key)}
              className={cn(
                "inline-flex h-8 items-center gap-2 rounded-lg border-2 px-3 text-ds-xxs font-bold transition-colors",
                on
                  ? ""
                  : "border-border bg-card text-foreground hover:bg-secondary"
              )}
              style={on ? { borderColor: c.color, color: c.color, backgroundColor: `${c.color}14` } : undefined}
            >
              <span className="size-2 rounded-full" style={{ backgroundColor: c.color }} />
              {c.label}
            </button>
          );
        })}
        </div>
      </div>

      {/* Calendar + day event list */}
      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Calendar
          mode="single"
          defaultMonth={new Date(2026, 5, 1)}
          selected={date}
          onSelect={setDate}
          modifiers={{ event: eventDays }}
        />
        <div className="min-w-0 space-y-3">
          <p className="text-ds-m font-bold text-foreground">
            {date
              ? date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
              : "Select a day"}
          </p>
          {dayEvents.length ? (
            dayEvents.map((e, i) => {
              const cat = CAT_MAP[e.cat];
              return (
                <div
                  key={i}
                  className="flex items-stretch gap-3 border-b-2 border-border py-3 last:border-b-0"
                >
                  <span className="w-1 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                  <div className="min-w-0">
                    <p className="text-ds-xs font-bold text-foreground">{e.title}</p>
                    <p className="text-ds-xxs font-medium text-muted-foreground">
                      {e.time} · {cat.label}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-ds-xs font-medium text-muted-foreground">
              No events on this day.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
