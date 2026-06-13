import * as React from "react"

import { cn } from "@/lib/utils"

type TextBlockProps = React.ComponentProps<"div"> & {
  category?: React.ReactNode
  categoryIcon?: React.ReactNode
  title?: React.ReactNode
  lead?: React.ReactNode
}

// DS text-block (section-body): optional category chip (brand-700 fill, white icon),
// xxxl brand-700 title, m brand-500 lead, xs foreground body copy.
function TextBlock({
  className,
  category,
  categoryIcon,
  title,
  lead,
  children,
  ...props
}: TextBlockProps) {
  return (
    <div
      data-slot="text-block"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      {category ? (
        <span className="inline-flex w-fit items-center gap-2 rounded-lg bg-brand-dark px-3 py-1.5 text-ds-xxs font-bold text-primary-foreground [&>svg]:size-4">
          {categoryIcon}
          {category}
        </span>
      ) : null}
      {title ? (
        <h2 className="font-heading text-ds-xxxl font-bold text-brand-dark">
          {title}
        </h2>
      ) : null}
      {lead ? <p className="text-ds-m font-bold text-primary">{lead}</p> : null}
      {children ? (
        <div className="space-y-3 text-ds-xs font-medium leading-relaxed text-foreground">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export { TextBlock }
