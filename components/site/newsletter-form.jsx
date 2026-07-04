"use client";

import { useActionState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { IconArrowRight } from "@/components/icons/ds-icons";
import { subscribe } from "./newsletter-actions";

const initialState = { status: "idle", message: null };

const inputClass =
  "h-11 w-full rounded-lg border-2 border-input bg-card px-4 text-ds-xs font-medium text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring";
const labelTextClass = "mb-1.5 block text-ds-xs font-medium text-foreground";

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribe, initialState);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="rounded-lg border-2 border-secondary bg-card px-4 py-5"
      >
        <p className="text-ds-xs font-bold text-brand-dark">{state.message}</p>
      </div>
    );
  }

  return (
    <div>
      <form
        action={formAction}
        className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]"
      >
        <label className="block">
          <span className={labelTextClass}>
            First Name <span className="text-primary">*</span>
          </span>
          <input
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            placeholder="Your first name"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelTextClass}>
            Email <span className="text-primary">*</span>
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Your Email"
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className={buttonVariants({ className: "px-5" })}
        >
          {pending ? "Subscribing…" : "Subscribe"}
          <IconArrowRight className="size-4" />
        </button>
      </form>

      {state.status === "error" && state.message ? (
        <p role="alert" className="mt-2 text-ds-xs font-medium text-destructive">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
