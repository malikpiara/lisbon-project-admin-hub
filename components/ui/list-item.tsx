import * as React from "react"

import { cn } from "@/lib/utils"

// DS list-item — header (type=header): brand-500 bold 15 section title.
function ListItemHeader({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="list-item-header"
      className={cn("pt-2 text-ds-xs font-bold text-primary", className)}
      {...props}
    />
  )
}

// DS list-item — row (type=row): leading icon + subtitle (left) and a
// right-aligned value, split by a 2px brand-200 bottom divider. py-3, 16px gap.
function ListItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="list-item"
      className={cn(
        "flex items-center gap-4 border-b-2 border-border py-3",
        className
      )}
      {...props}
    />
  )
}

function ListItemIcon({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="list-item-icon"
      className={cn(
        "flex size-4 shrink-0 items-center justify-center text-primary [&>svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

function ListItemSubtitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="list-item-subtitle"
      className={cn("min-w-0 flex-1 text-ds-xxs font-bold text-foreground", className)}
      {...props}
    />
  )
}

function ListItemValue({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="list-item-value"
      className={cn(
        "shrink-0 text-right text-ds-xxs font-medium text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { ListItem, ListItemHeader, ListItemIcon, ListItemSubtitle, ListItemValue }
