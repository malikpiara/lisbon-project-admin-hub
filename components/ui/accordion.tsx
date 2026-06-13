"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("w-full", className)}
      {...props}
    />
  )
}

// DS accordion item: 2px brand-200 bottom divider separates rows.
function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("group/item border-b-2 border-border", className)}
      {...props}
    />
  )
}

// DS accordion header: number badge (brand-200 pill, teal) + teal title + optional
// Label tag (brand-200 border, brand-800 text) + +/- toggle (brand-600).
function AccordionTrigger({
  className,
  number,
  tag,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  number?: React.ReactNode
  tag?: React.ReactNode
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex w-full items-center gap-2 py-2 text-left outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-ring/40",
          className
        )}
        {...props}
      >
        {number != null ? (
          <span className="flex shrink-0 items-center justify-center rounded-full bg-secondary px-2 py-0.5 text-ds-xxs font-bold text-primary">
            {number}
          </span>
        ) : null}
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="min-w-0 flex-1 text-ds-m font-bold text-primary">
            {children}
          </span>
          {tag != null ? (
            <span className="inline-flex min-h-8 shrink-0 items-center rounded-lg border-2 border-border px-3 text-ds-xxs font-bold text-brand-800">
              {tag}
            </span>
          ) : null}
        </span>
        <span className="flex min-h-11 shrink-0 items-center px-3 text-brand-link">
          <Plus
            className="size-4 group-data-[open]/item:hidden"
            strokeWidth={2.5}
          />
          <Minus
            className="hidden size-4 group-data-[open]/item:block"
            strokeWidth={2.5}
          />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Panel>) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        "h-[var(--accordion-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0",
        className
      )}
      {...props}
    >
      <div className="pb-6 text-ds-xxs font-medium leading-relaxed text-foreground">
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
