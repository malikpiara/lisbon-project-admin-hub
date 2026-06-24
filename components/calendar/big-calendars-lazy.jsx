"use client";

import dynamic from "next/dynamic";

// Defer react-big-calendar + moment (both heavy) out of the initial /calendar
// bundle. They drive two below-the-fold "reference visual" calendars, so a
// loading placeholder during load is fine. (Vercel: bundle-dynamic-imports.)
const fallback = () => (
  <div className="h-[480px] w-full animate-pulse rounded-xl border-2 border-border bg-secondary" />
);

export const BigCalendar = dynamic(
  () => import("./big-calendar").then((m) => m.BigCalendar),
  { ssr: false, loading: fallback }
);

export const BigCalendarAdamastor = dynamic(
  () => import("./big-calendar-adamastor").then((m) => m.BigCalendarAdamastor),
  { ssr: false, loading: fallback }
);
