import * as React from "react"

import { cn } from "@/lib/utils"

type TextBlockProps = React.ComponentProps<"div"> & {
  category?: React.ReactNode
  categoryIcon?: React.ReactNode
  title?: React.ReactNode
  lead?: React.ReactNode
}

// DS text-block (section-body): a header group = category row (brand-700 icon +
// OUTLINED tag chip) over an xxxl brand-700 title; then an m brand-500 lead
// (max 720) and xs brand-1000 body copy.
function TextBlock({
  className,
  category,
  categoryIcon,
  title,
  lead,
  children,
  ...props
}: TextBlockProps) {
  const hasCategory = category != null || categoryIcon != null
  return (
    <div
      data-slot="text-block"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      {hasCategory || title != null ? (
        <div className="flex flex-col gap-3">
          {hasCategory ? (
            <div className="flex items-center gap-2">
              {categoryIcon != null ? (
                <span className="flex size-6 shrink-0 items-center justify-center text-brand-dark [&>svg]:size-5">
                  {categoryIcon}
                </span>
              ) : null}
              {category != null ? (
                <span className="inline-flex min-h-8 items-center rounded-lg border-2 border-secondary px-3 text-ds-xxs font-bold text-brand-800">
                  {category}
                </span>
              ) : null}
            </div>
          ) : null}
          {title != null ? (
            <h2 className="font-heading text-ds-xxxl font-bold text-brand-dark">
              {title}
            </h2>
          ) : null}
        </div>
      ) : null}
      {lead != null ? (
        <p className="max-w-[720px] text-ds-m font-bold text-primary">{lead}</p>
      ) : null}
      {children ? (
        <div className="space-y-3 text-ds-xs font-medium leading-relaxed text-brand-deep">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export { TextBlock }
