"use client";

import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import { SampleDataBadge } from "@/components/analytics/sample-data-badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export type TopicView = { topic: string; views: number };

// Made-up example counts, shown only when a caller opts in with `sample` (the
// /components styleguide, or /admin/insights before PostHog is connected) — and
// then always labelled as sample data. Live counts come in via `data`; missing
// data is never silently replaced with these.
const SAMPLE_DATA: TopicView[] = [
  { topic: "Residence Permit", views: 312 },
  { topic: "Asylum Application", views: 268 },
  { topic: "Child Care", views: 221 },
  { topic: "Health Center", views: 187 },
  { topic: "Legal Support", views: 156 },
  { topic: "Job Search", views: 134 },
];

// DS primary teal (--primary = #1F8E87) for the bars; white in-bar labels.
const chartConfig = {
  views: { label: "Views", color: "var(--primary)" },
  label: { color: "var(--primary-foreground)" },
} satisfies ChartConfig;

export function TopicsViewedChart({
  data = [],
  sample = false,
  title = "Which topics have been seen the most?",
  description = "Unique views per topic · last 30 days",
  emptyLabel = "No topic views yet.",
}: {
  data?: TopicView[];
  /** Show the built-in example counts instead of `data`, clearly labelled. */
  sample?: boolean;
  title?: string;
  description?: string;
  emptyLabel?: ReactNode;
}) {
  const rows = sample ? SAMPLE_DATA : data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {sample ? (
          <CardAction>
            <SampleDataBadge />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="py-8 text-center text-ds-xs text-muted-foreground">{emptyLabel}</p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className={sample ? "opacity-60 grayscale" : undefined}
          >
            <BarChart
              accessibilityLayer
              data={rows}
              layout="vertical"
              margin={{ right: 24 }}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="topic"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                hide
              />
              <XAxis dataKey="views" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar dataKey="views" fill="var(--color-views)" radius={8}>
                <LabelList
                  dataKey="topic"
                  position="insideLeft"
                  offset={12}
                  className="fill-(--color-label)"
                  fontSize={13}
                />
                <LabelList
                  dataKey="views"
                  position="right"
                  offset={12}
                  className="fill-foreground"
                  fontSize={13}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
        {sample ? (
          <p className="mt-4 text-center text-ds-xs text-muted-foreground">
            Example numbers to preview the layout, not real visitor activity.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
