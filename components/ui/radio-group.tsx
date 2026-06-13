"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid gap-2", className)}
      {...props}
    />
  )
}

// DS radio-button: 24px circle, 2px border, white fill.
// default: neutral-500 border → hover: neutral-700 border / neutral-200 fill
// selected: brand-600 border + brand-600 dot → error: destructive border
function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioPrimitive.Root>) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "peer size-6 shrink-0 rounded-full border-2 outline-none transition-colors",
        "border-[var(--neutral-500)] bg-card",
        "hover:border-[var(--neutral-700)] hover:bg-[var(--neutral-200)]",
        "active:border-[var(--neutral-800)] active:bg-[var(--neutral-400)]",
        "data-[checked]:border-brand-link",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-50",
        "aria-invalid:border-destructive data-invalid:border-destructive",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <span className="size-2.5 rounded-full bg-brand-link" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
