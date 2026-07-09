"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

// CSS spinner (the DS has no spinner icon) — a spinning ring in currentColor.
function Spinner({ className = "" }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden
    />
  );
}

// A submit button that reflects the enclosing <form>'s pending state: the moment
// it's clicked it disables itself and shows a spinner, so a double-click can't
// fire the server action twice (the cause of accidental duplicate articles).
// Must be rendered INSIDE a <form action={…}> — useFormStatus reads that form.
export function SubmitButton({
  children,
  pendingLabel,
  icon: Icon,
  ...props
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} aria-busy={pending} {...props}>
      {pending ? (
        <Spinner className="size-3.5" />
      ) : Icon ? (
        <Icon className="size-3.5" />
      ) : null}
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
