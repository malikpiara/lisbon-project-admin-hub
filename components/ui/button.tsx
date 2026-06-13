import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex min-w-11 shrink-0 items-center justify-center rounded-lg border-2 border-transparent bg-clip-padding text-ds-s font-bold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-100 disabled:text-[var(--neutral-300)] disabled:opacity-100",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        // DS button-secondary: white bg, brand-300 border, teal label
        secondary:
          "border-brand-300 bg-brand-000 text-primary hover:bg-brand-100 active:bg-brand-200 aria-expanded:bg-brand-200 disabled:border-brand-200 disabled:bg-brand-000 disabled:text-brand-200 disabled:opacity-100",
        // DS button-tertiary: text-only, brand-600 → brand-800 (hover) → brand-900 (press)
        ghost:
          "text-brand-link hover:text-brand-800 active:text-brand-900 aria-expanded:text-brand-800 disabled:text-brand-200 disabled:opacity-100",
        // DS button-menu: nav item, brand-600 label; mint bg on hover/press; white + brand-400 border when selected
        menu:
          "text-brand-link hover:bg-brand-200 active:bg-brand-300 active:text-brand-900 aria-expanded:bg-brand-200 data-[selected]:border-brand-400 data-[selected]:bg-brand-000 disabled:text-brand-200 disabled:opacity-100",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 gap-2 px-4",
        xs: "h-8 min-w-8 gap-1 rounded-lg px-2 text-ds-xxs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-10 min-w-10 gap-1.5 rounded-lg px-3 text-ds-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-11 p-0",
        "icon-xs":
          "size-8 min-w-8 rounded-lg p-0 in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-10 min-w-10 rounded-lg p-0 in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ComponentProps<typeof ButtonPrimitive> & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
