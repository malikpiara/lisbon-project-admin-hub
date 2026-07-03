import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Input, InputSearch } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tag } from "@/components/ui/tag";

// Mini live previews for the /components gallery cards (Astryx-style browse
// grid). Primitives render a small real composition; page-level system
// components use their DS glyph — a live render would need an iframe per card.
// Cards are links, so every thumbnail sits under pointer-events-none.
export const COMPONENT_THUMBNAILS: Record<string, ReactNode> = {
  // Foundations
  colors: (
    <div className="flex items-center gap-2">
      {["bg-brand-800", "bg-primary", "bg-brand-300", "bg-secondary", "bg-bg-page"].map(
        (c) => (
          <span key={c} className={`size-8 rounded-full ring-2 ring-border ${c}`} />
        )
      )}
    </div>
  ),
  typography: (
    <span className="font-heading text-ds-xxxl font-bold text-brand-dark">
      Ag
    </span>
  ),
  radii: (
    <div className="flex items-end gap-3">
      <span className="size-10 rounded-sm bg-secondary ring-2 ring-border" />
      <span className="size-10 rounded-lg bg-secondary ring-2 ring-border" />
      <span className="size-10 rounded-2xl bg-secondary ring-2 ring-border" />
    </div>
  ),
  icons: (
    <div className="flex items-center gap-4 text-primary">
      <Icon name="hand-heart" className="size-7" />
      <Icon name="portugal" className="size-7" />
      <Icon name="users" className="size-7" />
      <Icon name="call-solo" className="size-7" />
    </div>
  ),

  // Primitives
  button: (
    <div className="flex items-center gap-2">
      <Button size="sm">Donate</Button>
      <Button size="sm" variant="secondary">
        Reset
      </Button>
    </div>
  ),
  tag: <Tag>Family Support</Tag>,
  card: (
    <div className="flex w-40 items-center gap-3 rounded-lg border-2 border-border bg-card p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-primary">
        <Icon name="home" className="size-4" />
      </span>
      <div className="min-w-0 space-y-1">
        <div className="h-2 w-16 rounded-full bg-brand-200" />
        <div className="h-2 w-20 rounded-full bg-muted" />
      </div>
    </div>
  ),
  "form-fields": <Input placeholder="Your Email" className="h-10 max-w-44" />,
  checkbox: (
    <div className="flex items-center gap-3">
      <Checkbox defaultChecked />
      <Checkbox />
      <Checkbox variant="secondary" defaultChecked />
    </div>
  ),
  radio: (
    <RadioGroup defaultValue="a" className="flex flex-row gap-3">
      <RadioGroupItem value="a" />
      <RadioGroupItem value="b" />
    </RadioGroup>
  ),
  breadcrumb: (
    <p className="text-ds-xxs font-bold">
      <span className="text-primary underline underline-offset-[3px]">Home</span>
      <span className="mx-1.5 text-muted-foreground">/</span>
      <span className="text-foreground">Services</span>
    </p>
  ),
  "list-item": (
    <div className="w-44 space-y-2">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="flex items-center gap-2 border-b-2 border-border pb-2"
        >
          <Icon name="clock" className="size-3.5 text-primary" />
          <div className="h-2 flex-1 rounded-full bg-muted" />
          <div className="h-2 w-8 rounded-full bg-brand-200" />
        </div>
      ))}
    </div>
  ),
  infobox: (
    <div className="flex w-44 items-center gap-2 rounded-lg border-2 border-brand-link bg-secondary px-3 py-2">
      <Icon name="info" className="size-4 shrink-0 text-foreground/25" />
      <div className="h-2 w-full rounded-full bg-brand-300" />
    </div>
  ),
  "text-block": (
    <div className="w-44 space-y-2">
      <div className="h-3 w-24 rounded-full bg-brand-dark/80" />
      <div className="h-2 w-36 rounded-full bg-brand-300" />
      <div className="h-2 w-40 rounded-full bg-muted" />
    </div>
  ),
  "input-affixes": (
    <InputSearch placeholder="Search..." className="h-10 max-w-44" />
  ),
  "photo-gallery": (
    <div className="relative h-20 w-36 overflow-hidden rounded-lg bg-brand-300">
      <div className="absolute bottom-1.5 left-1.5 flex gap-1">
        <span className="flex size-6 items-center justify-center rounded-lg bg-brand-000 text-primary ring-2 ring-brand-300">
          <Icon name="ui-arrow-left" className="size-3" />
        </span>
        <span className="flex size-6 items-center justify-center rounded-lg bg-brand-000 text-primary ring-2 ring-brand-300">
          <Icon name="ui-arrow-right" className="size-3" />
        </span>
      </div>
    </div>
  ),
  calendar: <Icon name="date" className="size-9 text-primary" />,
  accordion: (
    <div className="w-44 space-y-2">
      <div className="flex items-center gap-2 border-b-2 border-border pb-2">
        <span className="rounded-full bg-secondary px-1.5 text-ds-xxs font-bold text-primary">
          01
        </span>
        <div className="h-2 flex-1 rounded-full bg-muted" />
        <Icon name="minus" className="size-3 text-brand-link" />
      </div>
      <div className="flex items-center gap-2 border-b-2 border-border pb-2">
        <span className="rounded-full bg-secondary px-1.5 text-ds-xxs font-bold text-primary">
          02
        </span>
        <div className="h-2 flex-1 rounded-full bg-muted" />
        <Icon name="plus" className="size-3 text-brand-link" />
      </div>
    </div>
  ),
  select: (
    <div className="flex h-10 w-40 items-center justify-between rounded-lg border-2 border-input bg-card px-3 text-ds-xxs font-bold text-foreground">
      Housing
      <Icon name="ui-arrow-down" className="size-3.5 text-muted-foreground" />
    </div>
  ),
  table: (
    <div className="w-44 overflow-hidden rounded-lg ring-2 ring-border">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex gap-3 border-b-2 border-border bg-card px-3 py-2 last:border-b-0"
        >
          <div className="h-2 w-12 rounded-full bg-brand-200" />
          <div className="h-2 flex-1 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  ),
  tooltip: (
    <span className="rounded-lg bg-foreground px-3 py-1.5 text-ds-xxs font-medium text-background">
      Copies the hex value
    </span>
  ),

  // System components — DS glyphs in the CardService mint tile so the cards
  // carry the same visual weight as the primitives' live minis. (Live renders
  // would need an iframe per card; their pages have the real thing.)
  agenda: <SystemGlyph name="date" />,
  "main-menu": <SystemGlyph name="menu" />,
  "home-hero": <SystemGlyph name="lp" />,
  "quick-access": <SystemGlyph name="internal-link" />,
  "services-list": <SystemGlyph name="checklist" />,
  contacts: <SystemGlyph name="contact-book" />,
  "map-visit": <SystemGlyph name="location" />,
  "service-page": <SystemGlyph name="notes" />,
  "article-page": <SystemGlyph name="report" />,
  footer: <SystemGlyph name="ui-mail-open" />,
  "topics-viewed-chart": <SystemGlyph name="health-chart" />,
};

// The 64px brand-100 icon tile from CardService — a familiar DS shape that
// gives glyph-only cards the same density as live-preview cards.
function SystemGlyph({ name }: { name: string }) {
  return (
    <span className="flex size-16 items-center justify-center rounded-lg bg-brand-100 text-primary ring-2 ring-border">
      <Icon name={name} className="size-7" />
    </span>
  );
}
