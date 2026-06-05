import type { ReactNode } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

import { SelectDemo } from "./_components/select-demo";

const BUTTON_VARIANTS = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;
const BUTTON_SIZES = ["xs", "sm", "default", "lg"] as const;
const BADGE_VARIANTS = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
] as const;

const COLOR_SWATCHES = [
  { name: "background", className: "bg-background" },
  { name: "foreground", className: "bg-foreground" },
  { name: "card", className: "bg-card" },
  { name: "popover", className: "bg-popover" },
  { name: "primary", className: "bg-primary" },
  { name: "secondary", className: "bg-secondary" },
  { name: "muted", className: "bg-muted" },
  { name: "accent", className: "bg-accent" },
  { name: "destructive", className: "bg-destructive" },
  { name: "border", className: "bg-border" },
  { name: "ring", className: "bg-ring" },
  { name: "brand-yellow", className: "bg-brand-yellow" },
  { name: "brand-yellow-soft", className: "bg-brand-yellow-soft" },
  { name: "bg-page", className: "bg-bg-page" },
  { name: "bg-mint", className: "bg-bg-mint" },
] as const;

const RADII = [
  "rounded-sm",
  "rounded-md",
  "rounded-lg",
  "rounded-xl",
  "rounded-2xl",
  "rounded-3xl",
  "rounded-4xl",
] as const;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-b border-border py-10 first:pt-0 last:border-b-0"
    >
      <h2 className="font-heading mb-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <>
      <Section id="colors" title="Colors">
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-5">
          {COLOR_SWATCHES.map((s) => (
            <div key={s.name} className="flex flex-col gap-1.5">
              <div
                className={cn(
                  "h-14 w-full rounded-lg ring-1 ring-foreground/10",
                  s.className
                )}
              />
              <span className="text-xs text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="typography" title="Typography">
        <div className="space-y-3">
          <p className="font-heading text-4xl font-semibold">Heading · 4xl</p>
          <p className="font-heading text-2xl font-semibold">Heading · 2xl</p>
          <p className="text-xl font-medium">Body · xl</p>
          <p className="text-base">
            Body · base — the quick brown fox jumps over the lazy dog.
          </p>
          <p className="text-sm text-muted-foreground">
            Muted · sm — supporting copy and helper text.
          </p>
          <p className="font-mono text-sm">Mono · sm — code &amp; data</p>
        </div>
      </Section>

      <Section id="radii" title="Radii">
        <div className="flex flex-wrap items-end gap-4">
          {RADII.map((r) => (
            <div key={r} className="flex flex-col items-center gap-1.5">
              <div className={cn("size-16 bg-muted ring-1 ring-foreground/10", r)} />
              <span className="text-xs text-muted-foreground">{r}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="buttons" title="Buttons">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            {BUTTON_VARIANTS.map((v) => (
              <Button key={v} variant={v}>
                {v}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {BUTTON_SIZES.map((s) => (
              <Button key={s} size={s}>
                size {s}
              </Button>
            ))}
            <Button size="icon" aria-label="Add">
              <Plus />
            </Button>
            <Button variant="secondary" disabled>
              disabled
            </Button>
          </div>
        </div>
      </Section>

      <Section id="badges" title="Badges">
        <div className="flex flex-wrap items-center gap-3">
          {BADGE_VARIANTS.map((v) => (
            <Badge key={v} variant={v}>
              {v}
            </Badge>
          ))}
        </div>
      </Section>

      <Section id="cards" title="Cards">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Housing support</CardTitle>
              <CardDescription>
                Guidance on tenancy, rights, and finding a place to live.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Card body content sits here with the default size and spacing.
            </CardContent>
            <CardFooter>
              <Button size="sm">Open</Button>
            </CardFooter>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Compact card</CardTitle>
              <CardDescription>size=&quot;sm&quot; variant.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Tighter padding and gaps for dense layouts.
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section id="form-fields" title="Form fields">
        <div className="grid max-w-md gap-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Input
            </span>
            <Input placeholder="you@example.com" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Textarea
            </span>
            <Textarea placeholder="Write a message…" rows={3} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Disabled input
            </span>
            <Input placeholder="Disabled" disabled />
          </label>
        </div>
      </Section>

      <Section id="select" title="Select">
        <SelectDemo />
      </Section>

      <Section id="table" title="Table">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Housing</TableCell>
              <TableCell>Ana Silva</TableCell>
              <TableCell>
                <Badge variant="secondary">Active</Badge>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Legal aid</TableCell>
              <TableCell>João Pereira</TableCell>
              <TableCell>
                <Badge variant="outline">Pending</Badge>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Section>

      <Section id="collapsible" title="Collapsible">
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="inline-flex h-8 items-center rounded-lg border border-border px-2.5 text-sm font-medium transition-colors hover:bg-muted">
            Toggle details
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Content revealed by the collapsible. Useful for FAQ rows and dense
            service pages.
          </CollapsibleContent>
        </Collapsible>
      </Section>
    </>
  );
}
