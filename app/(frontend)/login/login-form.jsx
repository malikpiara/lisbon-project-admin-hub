"use client";

import { useActionState } from "react";
import { Input, InputPassword } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "./actions";

const labelClass = "mb-1.5 block text-ds-xs font-medium text-foreground";
const initialState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className={labelClass}>Email</span>
        <Input
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          placeholder="you@thelisbonproject.org"
        />
      </label>

      <label className="block">
        <span className={labelClass}>Password</span>
        <InputPassword
          name="password"
          autoComplete="current-password"
          required
        />
      </label>

      {state?.error ? (
        <p
          role="alert"
          className="text-ds-xs font-medium text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
