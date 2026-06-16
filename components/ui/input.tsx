"use client"

import * as React from "react"
import { IconEyeClosed, IconEyeOpen, IconSearch } from "@/components/icons/ds-icons"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<typeof InputPrimitive>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border-2 border-input bg-card px-4 py-2 text-ds-xs font-bold text-[var(--text-secondary)] transition-colors outline-none hover:border-muted-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-ds-xs file:font-medium file:text-foreground placeholder:text-[var(--neutral-500)] focus-visible:border-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-[var(--neutral-200)] disabled:bg-[var(--neutral-200)] disabled:text-[var(--neutral-500)] aria-invalid:border-destructive dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props} />
  );
}

// DS input-search: leading search icon + input field (pl padding for the icon).
function InputSearch({
  className,
  ...props
}: React.ComponentProps<typeof InputPrimitive>) {
  return (
    <div className="relative w-full">
      <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" className={cn("pl-11", className)} {...props} />
    </div>
  )
}

// DS input-password: input field + trailing show/hide eye toggle.
function InputPassword({
  className,
  ...props
}: React.ComponentProps<typeof InputPrimitive>) {
  const [visible, setVisible] = React.useState(false)
  return (
    <div className="relative w-full">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {visible ? <IconEyeClosed className="size-4" /> : <IconEyeOpen className="size-4" />}
      </button>
    </div>
  )
}

export { Input, InputSearch, InputPassword }
