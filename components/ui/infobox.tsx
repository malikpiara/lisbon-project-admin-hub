import * as React from "react"
import { IconInfo } from "@/components/icons/ds-icons"

import { cn } from "@/lib/utils"

type InfoboxProps = React.ComponentProps<"div"> & {
  icon?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

// DS infobox: brand-200 fill, brand-600 2px border, radius 16. Faded info icon,
// bold title + medium description (text-secondary), optional trailing action.
function Infobox({
  className,
  icon,
  title,
  description,
  action,
  children,
  ...props
}: InfoboxProps) {
  return (
    <div
      data-slot="infobox"
      className={cn(
        "flex items-center gap-4 rounded-lg border-2 border-brand-link bg-secondary px-4 py-2",
        className
      )}
      {...props}
    >
      <span
        data-slot="infobox-icon"
        className="shrink-0 text-foreground/25 [&>svg]:size-4"
      >
        {icon ?? <IconInfo />}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title ? (
          <p className="text-ds-xxs font-bold text-foreground">{title}</p>
        ) : null}
        {description ? (
          <p className="text-ds-xxs font-medium text-[var(--text-secondary)]">
            {description}
          </p>
        ) : null}
        {children}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export { Infobox }
