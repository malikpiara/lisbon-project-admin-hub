"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// DS calendar (built on react-day-picker v10): white card, bold month title + chevron nav,
// Monday-start 3-letter weekdays (muted), rounded day cells.
// RDP v10 marks state on the gridcell (data-selected / data-today), so we target the
// inner button via group-data-* on the cell. Selected = outline box; today = teal + bold.
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      weekStartsOn={1}
      formatters={{
        formatWeekdayName: (date) =>
          date.toLocaleDateString("en-US", { weekday: "short" }),
      }}
      className={cn(
        "w-fit rounded-xl border-2 border-border bg-card p-4 text-card-foreground",
        className
      )}
      classNames={{
        months: "relative flex flex-col gap-4",
        month: "flex flex-col gap-3",
        month_caption: "flex h-9 items-center px-1",
        caption_label: "text-ds-s font-bold text-foreground",
        nav: "absolute right-0 top-0 flex items-center gap-1",
        button_previous: cn(buttonVariants({ variant: "ghost", size: "icon-sm" })),
        button_next: cn(buttonVariants({ variant: "ghost", size: "icon-sm" })),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "flex-1 select-none pb-1 text-ds-xs font-bold text-muted-foreground",
        weeks: "flex flex-col",
        week: "mt-1 flex w-full",
        day: "group/day relative flex-1 select-none p-0.5 text-center",
        day_button: cn(
          "relative mx-auto flex size-12 items-center justify-center rounded-lg text-ds-xs font-bold text-foreground transition-colors",
          "hover:bg-secondary active:bg-bg-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          // today (DayFlag on the cell): neutral-grey outline box
          "group-data-[today=true]/day:border-2 group-data-[today=true]/day:border-input group-data-[today=true]/day:font-bold",
          // selected (SelectionState on the cell): teal outline box + mint fill (wins over today)
          "group-data-[selected=true]/day:border-2 group-data-[selected=true]/day:border-primary group-data-[selected=true]/day:bg-secondary group-data-[selected=true]/day:font-bold group-data-[selected=true]/day:text-foreground"
        ),
        today: "",
        selected: "",
        outside: "[&_button]:text-muted-foreground/40",
        disabled: "[&_button]:pointer-events-none [&_button]:opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: cls, ...p }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("size-4", cls)} {...p} />
          ) : (
            <ChevronRight className={cn("size-4", cls)} {...p} />
          ),
        // Render a teal dot under days carrying the custom `event` modifier.
        DayButton: ({ day: _day, modifiers, className: cls, children, ...rest }) => (
          <button className={cls} {...rest}>
            {children}
            {(modifiers as Record<string, boolean>).event ? (
              <span className="pointer-events-none absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary" />
            ) : null}
          </button>
        ),
      }}
      {...props}
    />
  )
}

export { Calendar }
