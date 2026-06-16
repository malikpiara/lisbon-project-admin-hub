import * as React from "react"
import { IconArrowRight } from "@/components/icons/ds-icons"

import { cn } from "@/lib/utils"

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-lg border-2 border-border bg-card py-4 text-ds-xs text-card-foreground has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 xl:py-6 *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg",
        className
      )}
      {...props} />
  );
}

function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-lg px-4 xl:px-6 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className
      )}
      {...props} />
  );
}

function CardTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-ds-s leading-snug font-bold group-data-[size=sm]/card:text-ds-xs",
        className
      )}
      {...props} />
  );
}

function CardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-ds-xs text-muted-foreground", className)}
      {...props} />
  );
}

function CardAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props} />
  );
}

function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 xl:px-6 group-data-[size=sm]/card:px-3", className)}
      {...props} />
  );
}

function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-lg px-4 pb-4 xl:px-6 xl:pb-6 group-data-[size=sm]/card:px-3 group-data-[size=sm]/card:pb-3",
        className
      )}
      {...props} />
  );
}

// DS card-service: horizontal row — brand-100 icon tile (teal icon) + title/description + chevron.
function CardService({
  className,
  icon,
  title,
  description,
  showChevron = true,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  showChevron?: boolean
}) {
  return (
    <div
      data-slot="card-service"
      className={cn(
        "flex min-w-[180px] items-center gap-4 rounded-lg border-2 border-border bg-card p-4 text-left xl:p-6",
        className
      )}
      {...props}
    >
      {icon ? (
        <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-primary [&>svg]:size-6">
          {icon}
        </span>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title ? (
          <p className="text-ds-l font-bold text-foreground">{title}</p>
        ) : null}
        {description ? (
          <p className="text-ds-s font-medium text-foreground">{description}</p>
        ) : null}
      </div>
      {showChevron ? (
        <IconArrowRight className="size-4 shrink-0 text-primary" />
      ) : null}
    </div>
  )
}

// DS card-shortcut: vertical — large icon + title/description + primary action button.
function CardShortcut({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: React.ReactNode
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div
      data-slot="card-shortcut"
      className={cn(
        "flex min-w-[280px] flex-col items-start gap-4 rounded-lg border-2 border-border bg-card p-4 xl:p-6",
        className
      )}
      {...props}
    >
      <div className="flex w-full flex-col gap-0.5">
        {icon ? (
          <span className="mb-2 flex items-center text-bg-mint [&>svg]:size-14">
            {icon}
          </span>
        ) : null}
        {title ? (
          <p className="text-ds-l font-bold text-foreground">{title}</p>
        ) : null}
        {description ? (
          <p className="text-ds-s font-medium text-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

// DS card-schedule: clock-header card holding schedule rows (ListItem) + an
// optional infobox footer. Pass the rows as children and an <Infobox/> as footer.
function CardSchedule({
  className,
  icon,
  title,
  footer,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: React.ReactNode
  title?: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div
      data-slot="card-schedule"
      className={cn(
        "flex min-w-[280px] flex-col gap-4 rounded-lg border-2 border-border bg-card p-4 xl:p-6",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {icon ? (
          <span className="flex size-6 shrink-0 items-center justify-center text-primary [&>svg]:size-5">
            {icon}
          </span>
        ) : null}
        {title ? (
          <p className="text-ds-m font-bold text-primary">{title}</p>
        ) : null}
      </div>
      {children ? <div className="flex flex-col">{children}</div> : null}
      {footer}
    </div>
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardService,
  CardShortcut,
  CardSchedule,
}
