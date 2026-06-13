"use client";

import * as React from "react";

import { Calendar } from "@/components/ui/calendar";

export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 5, 11));
  return (
    <Calendar
      mode="single"
      defaultMonth={new Date(2026, 5, 1)}
      selected={date}
      onSelect={setDate}
    />
  );
}
