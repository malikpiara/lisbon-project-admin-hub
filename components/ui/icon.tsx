import * as React from "react"

import { DS_ICONS } from "@/lib/ds-icons-data"
import { cn } from "@/lib/utils"

// DS iconography: inlines the design-system SVG (filled, normalized to currentColor)
// so it inherits text color and scales to the wrapper. Renders nothing for unknown names.
function Icon({
  name,
  className,
  children: _children,
  ...props
}: { name: string } & React.ComponentProps<"span">) {
  const svg = DS_ICONS[name]
  if (!svg) return null
  return (
    <span
      data-slot="icon"
      data-icon={name}
      aria-hidden="true"
      className={cn("inline-flex size-6 shrink-0 [&>svg]:size-full", className)}
      dangerouslySetInnerHTML={{ __html: svg }}
      {...props}
    />
  )
}

export { Icon }
