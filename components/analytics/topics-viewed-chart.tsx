"use client";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import {
  Card,
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

// Sample data (real-domain topic names). Swap for live counts from the
// `topic_viewed` PostHog insight — pass them in via the `data` prop.
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
  data = SAMPLE_DATA,
  title = "Which topics have been seen the most?",
  description = "Unique views per topic · last 30 days",
}: {
  data?: TopicView[];
  title?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
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
      </CardContent>
    </Card>
  );
}
