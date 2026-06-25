"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/admin/field";
import { DeleteButton } from "@/components/admin/delete-button";
import { createUser, deleteUser, setUserPassword } from "./actions";

export function UsersManager({ users }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const add = () =>
    startTransition(async () => {
      setError(null);
      const res = await createUser(form);
      if (res?.ok) {
        setForm({ name: "", email: "", password: "" });
        router.refresh();
      } else {
        setError(res?.error || "Could not add this person.");
      }
    });

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <header>
        <h1 className="font-heading text-ds-xxl font-bold text-foreground">
          Team
        </h1>
        <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
          People who can sign in and edit content. Adding someone here lets them
          log in.
        </p>
      </header>

      <Card className="mt-6">
        <div className="px-4 xl:px-6">
          <h2 className="font-heading text-ds-s font-bold text-foreground">
            Add a volunteer
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <Field
              label="Name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <Field
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            />
            <Field
              label="Initial password"
              required
              value={form.password}
              onChange={(v) => setForm((f) => ({ ...f, password: v }))}
              hint="They sign in with this — share it securely."
            />
          </div>
          {error ? (
            <p className="mt-2 text-ds-xxs font-medium text-destructive">
              {error}
            </p>
          ) : null}
          <div className="mt-4">
            <Button
              size="sm"
              onClick={add}
              disabled={isPending || !form.email.trim() || !form.password}
            >
              <UserPlus className="size-3.5" />
              Add volunteer
            </Button>
          </div>
        </div>
      </Card>

      <p className="mt-8 text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground">
        {users.length} {users.length === 1 ? "person" : "people"}
      </p>
      <div className="mt-3 space-y-2">
        {users.map((u) => (
          <UserRow key={u.id} user={u} onChanged={() => router.refresh()} />
        ))}
      </div>
    </div>
  );
}

function UserRow({ user, onChanged }) {
  const [resetting, setResetting] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const savePassword = () =>
    startTransition(async () => {
      setError(null);
      const res = await setUserPassword(user.id, password);
      if (res?.ok) {
        setResetting(false);
        setPassword("");
        onChanged();
      } else {
        setError(res?.error || "Could not reset the password.");
      }
    });

  return (
    <Card>
      <div className="flex flex-col gap-3 px-4 xl:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-ds-xs font-bold text-foreground">
              {user.name || "—"}
              {user.isSelf ? (
                <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-ds-xxs font-bold text-primary">
                  You
                </span>
              ) : null}
            </p>
            <p className="truncate text-ds-xxs font-medium text-muted-foreground">
              {user.email}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {resetting ? null : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setResetting(true)}
              >
                Reset password
              </Button>
            )}
            {user.isSelf ? null : (
              <DeleteButton
                label="Remove"
                onConfirm={() =>
                  startTransition(async () => {
                    await deleteUser(user.id);
                    onChanged();
                  })
                }
              />
            )}
          </div>
        </div>

        {resetting ? (
          <div className="flex items-end gap-2 border-t-2 border-border pt-3">
            <Field
              className="flex-1"
              label="New password"
              value={password}
              onChange={setPassword}
              hint="Share the new password with them securely."
            />
            <Button
              size="sm"
              onClick={savePassword}
              disabled={isPending || !password}
            >
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setResetting(false);
                setPassword("");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        ) : null}
        {error ? (
          <p className="text-ds-xxs font-medium text-destructive">{error}</p>
        ) : null}
      </div>
    </Card>
  );
}
