"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"
import { CheckIcon } from "lucide-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// DS checkbox: 24px box, 4px radius, 2px border.
// primary: neutral-200 fill / neutral-500 border → selected white + brand-600 border/check.
// secondary: brand-100 mint fill / brand-300 border → selected brand-500 border/check.
const checkboxVariants = cva(
  "peer size-6 shrink-0 rounded-sm border-2 outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive data-invalid:border-destructive",
  {
    variants: {
      variant: {
        primary:
          "border-[var(--neutral-500)] bg-[var(--neutral-200)] hover:border-muted-foreground hover:bg-[var(--neutral-300)] active:border-[var(--neutral-700)] active:bg-[var(--neutral-300)] data-[checked]:border-brand-link data-[checked]:bg-card",
        secondary:
          "border-brand-300 bg-brand-100 hover:border-brand-400 active:border-brand-400 active:bg-brand-200 data-[checked]:border-primary data-[checked]:bg-brand-100",
      },
    },
    defaultVariants: { variant: "primary" },
  }
)

function Checkbox({
  className,
  variant = "primary",
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> &
  VariantProps<typeof checkboxVariants>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(checkboxVariants({ variant }), className)}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={cn(
          "flex items-center justify-center",
          variant === "secondary" ? "text-primary" : "text-brand-link"
        )}
      >
        <CheckIcon className="size-4" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
