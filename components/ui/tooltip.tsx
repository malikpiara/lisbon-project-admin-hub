"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delay = 150,
  closeDelay = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider delay={delay} closeDelay={closeDelay} {...props} />
  )
}

function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props} />
}

const TooltipTrigger = TooltipPrimitive.Trigger

function TooltipContent({
  className,
  side = "top",
  sideOffset = 6,
  align = "center",
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Popup> &
  Pick<
    React.ComponentProps<typeof TooltipPrimitive.Positioner>,
    "side" | "sideOffset" | "align"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        className="z-50"
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "group z-50 max-w-64 origin-(--transform-origin) rounded-lg bg-foreground px-3 py-2 text-ds-xxs font-medium text-background shadow-lg duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        >
          {children}
          {/* Base UI centres the arrow along the anchor axis but leaves the
              cross-axis offset to CSS — pin it outside the bubble edge per
              side. The 14x7 box keeps its layout size when rotated, hence the
              10.5px (7 + 3.5) offsets on the vertical sides. */}
          <TooltipPrimitive.Arrow
            className={cn(
              "group-data-[side=top]:bottom-[-7px]",
              "group-data-[side=bottom]:top-[-7px] group-data-[side=bottom]:rotate-180",
              "group-data-[side=left]:right-[-10.5px] group-data-[side=left]:-rotate-90",
              "group-data-[side=right]:left-[-10.5px] group-data-[side=right]:rotate-90"
            )}
          >
            <svg
              width="14"
              height="7"
              viewBox="0 0 14 7"
              aria-hidden="true"
              className="block fill-foreground"
            >
              <path d="M0 0 H14 L7 7 Z" />
            </svg>
          </TooltipPrimitive.Arrow>
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
