"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dices, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputPassword } from "@/components/ui/input";
import { Field, SelectField } from "@/components/admin/field";
import { DeleteButton } from "@/components/admin/delete-button";
import { createUser, deleteUser, setUserPassword, updateUser } from "./actions";

const ROLE_OPTIONS = [
  { value: "editor", label: "Editor — manages content" },
  { value: "admin", label: "Admin — also manages the team" },
];

// Readable one-time password: 3 blocks of 4, no ambiguous characters
// (0/O, 1/l/I). The person changes it after first sign-in.
function generatePassword() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]);
  return `${chars.slice(0, 4).join("")}-${chars.slice(4, 8).join("")}-${chars.slice(8).join("")}`;
}

// Initials for the row avatar: first + last from a name, else the first two
// letters of the email local part. A small anchor that makes the team list
// scannable at a glance.
function initials(name, email) {
  const src = (name || "").trim();
  if (src) {
    const parts = src.split(/\s+/).filter(Boolean);
    if (parts.length >= 2)
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return src.slice(0, 2).toUpperCase();
  }
  return (email || "?").slice(0, 2).toUpperCase();
}

// Label + InputPassword + optional dice button, styled like Field.
function PasswordField({ label, value, onChange, hint, onGenerate }) {
  return (
    <div className="block">
      <span className="mb-1.5 block text-ds-xs font-medium text-foreground">
        {label}
        <span className="ml-0.5 text-destructive" aria-hidden>
          *
        </span>
      </span>
      <div className="flex items-center gap-2">
        <InputPassword
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        {onGenerate ? (
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={onGenerate}
            title="Generate a password"
          >
            <Dices className="size-3.5" />
            Generate
          </Button>
        ) : null}
      </div>
      {hint ? (
        <span className="mt-1.5 block text-ds-xxs font-medium text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

export function UsersManager({ users }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" });
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const add = () =>
    startTransition(async () => {
      setError(null);
      const res = await createUser(form);
      if (res?.ok) {
        setForm({ name: "", email: "", password: "", role: "editor" });
        router.refresh();
      } else {
        setError(res?.error || "Could not add this person.");
      }
    });

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
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
            Add a team member
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
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
            <PasswordField
              label="Initial password"
              value={form.password}
              onChange={(v) => setForm((f) => ({ ...f, password: v }))}
              onGenerate={() =>
                setForm((f) => ({ ...f, password: generatePassword() }))
              }
              hint="They sign in with this — share it securely and ask them to change it."
            />
            <SelectField
              label="Role"
              value={form.role}
              onChange={(v) => setForm((f) => ({ ...f, role: v ?? "editor" }))}
              options={ROLE_OPTIONS}
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
              Add team member
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
  const [mode, setMode] = useState(null); // null | "reset" | "edit"
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  });
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const close = () => {
    setMode(null);
    setPassword("");
    setProfile({ name: user.name, email: user.email, role: user.role });
    setError(null);
  };

  const savePassword = () =>
    startTransition(async () => {
      setError(null);
      const res = await setUserPassword(user.id, password);
      if (res?.ok) {
        close();
        onChanged();
      } else {
        setError(res?.error || "Could not reset the password.");
      }
    });

  const saveProfile = () =>
    startTransition(async () => {
      setError(null);
      const res = await updateUser(user.id, {
        name: profile.name,
        email: profile.email,
        // Own role is locked server-side too; don't send it at all.
        ...(user.isSelf ? {} : { role: profile.role }),
      });
      if (res?.ok) {
        setMode(null);
        setError(null);
        onChanged();
      } else {
        setError(res?.error || "Could not save the changes.");
      }
    });

  return (
    <Card>
      <div className="flex flex-col gap-3 px-4 xl:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-ds-xxs font-bold text-primary"
            >
              {initials(user.name, user.email)}
            </span>
            <div className="min-w-0">
            <p className="truncate text-ds-xs font-bold text-foreground">
              {user.name || "—"}
              <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-ds-xxs font-bold text-muted-foreground">
                {user.role === "admin" ? "Admin" : "Editor"}
              </span>
              {user.isSelf ? (
                <span className="ml-1.5 rounded-full bg-secondary px-2 py-0.5 text-ds-xxs font-bold text-primary">
                  You
                </span>
              ) : null}
            </p>
            <p className="truncate text-ds-xxs font-medium text-muted-foreground">
              {user.email}
            </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {mode ? null : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMode("edit")}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMode("reset")}
                >
                  Reset password
                </Button>
              </>
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

        {mode === "edit" ? (
          <div className="border-t-2 border-border pt-3">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Name"
                value={profile.name}
                onChange={(v) => setProfile((p) => ({ ...p, name: v }))}
              />
              <Field
                label="Email"
                type="email"
                required
                value={profile.email}
                onChange={(v) => setProfile((p) => ({ ...p, email: v }))}
              />
              {user.isSelf ? null : (
                <SelectField
                  label="Role"
                  value={profile.role}
                  onChange={(v) =>
                    setProfile((p) => ({ ...p, role: v ?? p.role }))
                  }
                  options={ROLE_OPTIONS}
                />
              )}
            </div>
            {user.isSelf ? (
              <p className="mt-2 text-ds-xxs font-medium text-muted-foreground">
                You can&rsquo;t change your own role — ask another admin.
              </p>
            ) : null}
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={saveProfile}
                disabled={isPending || !profile.email.trim()}
              >
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={close}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {mode === "reset" ? (
          <div className="flex items-end gap-2 border-t-2 border-border pt-3">
            <div className="flex-1">
              <PasswordField
                label="New password"
                value={password}
                onChange={setPassword}
                onGenerate={() => setPassword(generatePassword())}
                hint="Share the new password with them securely."
              />
            </div>
            <Button
              size="sm"
              onClick={savePassword}
              disabled={isPending || !password}
            >
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={close}>
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
