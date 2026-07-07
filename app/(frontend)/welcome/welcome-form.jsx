"use client";

import { useActionState } from "react";

import { InputPassword } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setPasswordAndSignIn } from "./actions";

const initialState = { error: null };

// One field, not password + confirm: the eye toggle on InputPassword lets
// people check what they typed, which prevents more typos than a second
// blind field does — and it's half the work on a phone.
export function WelcomeForm({ token }) {
  const [state, formAction, pending] = useActionState(
    setPasswordAndSignIn,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      <label className="block">
        <span className="mb-1.5 block text-ds-xs font-medium text-foreground">
          Password
        </span>
        <InputPassword
          name="password"
          autoComplete="new-password"
          autoFocus
          required
          minLength={8}
          placeholder="At least 8 characters"
        />
        <span className="mt-1.5 block text-ds-xxs font-medium text-muted-foreground">
          Tip: three or four random words are easy to remember and hard to
          guess.
        </span>
      </label>

      {state?.error ? (
        <p role="alert" className="text-ds-xs font-medium text-destructive">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Setting up…" : "Set password and sign in"}
      </Button>
    </form>
  );
}
