"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, InputPassword } from "@/components/ui/input";
import { IconCheck, IconUserPlus } from "@/components/icons/ds-icons";
import { Field, SelectField } from "@/components/admin/field";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  createPasswordLink,
  createUser,
  deleteUser,
  setOwnPassword,
  updateUser,
} from "./actions";

// Light-touch shape check (something@something.tld) to gate submit buttons.
// Real validation stays server-side with Payload; this only stops the obvious
// half-typed state from being submittable.
const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

const ROLE_OPTIONS = [
  { value: "editor", label: "Editor — manages content" },
  { value: "admin", label: "Admin — also manages the team" },
];

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

// The invite/reset link with a one-click copy. The button confirms in place
// ("Copied!") because the admin's next move — pasting into WhatsApp or email —
// happens outside this app, so this is the last feedback we can give them.
function CopyLinkField({ link }) {
  // idle → copied (clipboard worked) or manual (blocked: the text is left
  // selected and the button tells them the keystroke). Every click gets a
  // response — a copy button that fails silently reads as broken.
  const [state, setState] = useState("idle");
  const inputRef = useRef(null);

  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(link);
      ok = true;
    } catch {
      // Clipboard API can be blocked (older browsers, http, permissions).
      const el = inputRef.current;
      if (el) {
        el.focus();
        el.select();
        try {
          ok = document.execCommand("copy");
        } catch {
          ok = false;
        }
      }
    }
    setState(ok ? "copied" : "manual");
    setTimeout(() => setState("idle"), ok ? 2000 : 4000);
  };

  const isMac =
    typeof navigator !== "undefined" && /Mac/i.test(navigator.userAgent);

  return (
    <div className="flex items-center gap-2">
      <Input
        ref={inputRef}
        readOnly
        value={link}
        onFocus={(e) => e.target.select()}
        aria-label="Invite link"
        className="flex-1 text-ds-xxs"
      />
      <Button size="sm" onClick={copy} className="min-w-28">
        {state === "copied" ? (
          <>
            <IconCheck className="size-3.5" />
            Copied!
          </>
        ) : state === "manual" ? (
          <>{isMac ? "Press ⌘ C" : "Press Ctrl C"}</>
        ) : (
          <>
            <Copy className="size-3.5" />
            Copy link
          </>
        )}
      </Button>
    </div>
  );
}

// Success surface shown after an account or reset link is created. States the
// three things the admin must know — send it, it works once, it expires — right
// next to the link, every time, so nothing relies on memory.
function LinkPanel({ heading, message, footnote, link, children }) {
  return (
    <div className="rounded-lg bg-secondary p-4">
      <div className="flex items-center gap-2">
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <IconCheck className="size-3.5" />
        </span>
        <p className="text-ds-xs font-bold text-foreground">{heading}</p>
      </div>
      <p className="mt-2 text-ds-xxs font-medium text-muted-foreground">
        {message}
      </p>
      <div className="mt-3">
        <CopyLinkField link={link} />
      </div>
      {footnote ? (
        <p className="mt-2 text-ds-xxs font-medium text-muted-foreground">
          {footnote}
        </p>
      ) : null}
      {children ? <div className="mt-3 flex gap-2">{children}</div> : null}
    </div>
  );
}

export function UsersManager({ users }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [invite, setInvite] = useState(null); // { name, link } after a create
  const [form, setForm] = useState({ name: "", email: "", role: "editor" });
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const closeAdd = () => {
    setAdding(false);
    setInvite(null);
    setForm({ name: "", email: "", role: "editor" });
    setError(null);
  };

  const add = () =>
    startTransition(async () => {
      setError(null);
      const res = await createUser(form);
      if (res?.ok) {
        setInvite({ name: res.name, link: res.link });
        setForm({ name: "", email: "", role: "editor" });
        router.refresh();
      } else {
        setError(res?.error || "Could not add this person.");
      }
    });

  return (
    <div className="mx-auto max-w-5xl px-8 pt-12 pb-28">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-ds-xxl font-bold text-foreground">
            Team
          </h1>
          <p className="mt-2 max-w-2xl text-ds-xs font-medium leading-relaxed text-muted-foreground">
            People who can sign in and edit content.
          </p>
        </div>
        {adding || invite ? null : (
          <Button size="sm" onClick={() => setAdding(true)}>
            <IconUserPlus className="size-3.5" />
            Add team member
          </Button>
        )}
      </header>

      {adding && !invite ? (
        <Card className="mt-8">
          <div className="px-4 xl:px-6">
            <h2 className="font-heading text-ds-s font-bold text-foreground">
              Add a team member
            </h2>
            <p className="mt-1 text-ds-xxs font-medium text-muted-foreground">
              You&rsquo;ll get a link to send them — they choose their own
              password.
            </p>
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
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                onClick={add}
                disabled={isPending || !looksLikeEmail(form.email)}
              >
                {isPending ? "Adding…" : "Add & get invite link"}
              </Button>
              <Button variant="ghost" size="sm" onClick={closeAdd}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      {invite ? (
        <Card className="mt-8">
          <div className="px-4 xl:px-6">
            <LinkPanel
              heading={`${invite.name} is on the team`}
              message="Send them this link — it works once and expires in 7 days. They'll use it to choose their own password and sign in."
              footnote="Lost it? Their row below shows they're invited — copy a fresh link from there anytime."
              link={invite.link}
            >
              <Button size="sm" variant="secondary" onClick={closeAdd}>
                Done
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setInvite(null);
                  setAdding(true);
                }}
              >
                Add another person
              </Button>
            </LinkPanel>
          </div>
        </Card>
      ) : null}

      <p className="mt-8 text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground">
        {users.length} {users.length === 1 ? "person" : "people"}
      </p>
      <div className="mt-4 space-y-2.5">
        {users.map((u) => (
          <UserRow key={u.id} user={u} onChanged={() => router.refresh()} />
        ))}
      </div>
    </div>
  );
}

function UserRow({ user, onChanged }) {
  const [mode, setMode] = useState(null); // null | "edit" | "password"
  const [resetLink, setResetLink] = useState(null);
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState(null);
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
  });
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  const close = () => {
    setMode(null);
    setResetLink(null);
    setPassword("");
    setProfile({ name: user.name, email: user.email, role: user.role });
    setError(null);
  };

  // Others: one click creates the single-use link and shows it — no
  // intermediate "are you sure" (creating a link is harmless; it supersedes
  // any earlier link, and a member's current password keeps working until
  // they use it). The server picks invite vs reset from whether they joined.
  const makePasswordLink = () =>
    startTransition(async () => {
      setError(null);
      setNotice(null);
      const res = await createPasswordLink(user.id);
      if (res?.ok) {
        setMode(null);
        setResetLink({ link: res.link, kind: res.kind });
      } else {
        setError(res?.error || "Could not create the link.");
      }
    });

  // Self: typing your own new password directly beats mailing yourself a link.
  const changeOwnPassword = () =>
    startTransition(async () => {
      setError(null);
      const res = await setOwnPassword(password);
      if (res?.ok) {
        close();
        setNotice("Your password was changed.");
      } else {
        setError(res?.error || "Could not change the password.");
      }
    });

  const saveProfile = () =>
    startTransition(async () => {
      setError(null);
      setNotice(null);
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
                {!user.joined ? (
                  user.inviteLinkAlive ? (
                    <span className="ml-1.5 rounded-full border-2 border-border px-2 py-0.5 text-ds-xxs font-bold text-muted-foreground">
                      Invited
                    </span>
                  ) : (
                    <span className="ml-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-ds-xxs font-bold text-destructive">
                      Invite expired
                    </span>
                  )
                ) : null}
              </p>
              <p className="truncate text-ds-xxs font-medium text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {mode || resetLink ? null : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setMode("edit")}
                >
                  Edit
                </Button>
                {user.isSelf ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setMode("password")}
                  >
                    Change password
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={makePasswordLink}
                    disabled={isPending}
                  >
                    {isPending
                      ? "Creating link…"
                      : user.joined
                        ? "Reset password"
                        : "Copy invite link"}
                  </Button>
                )}
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
                disabled={isPending || !looksLikeEmail(profile.email)}
              >
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={close}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {mode === "password" ? (
          <div className="border-t-2 border-border pt-3">
            <label className="block sm:max-w-sm">
              <span className="mb-1.5 block text-ds-xs font-medium text-foreground">
                New password
              </span>
              <InputPassword
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
              />
            </label>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={changeOwnPassword}
                disabled={isPending || password.length < 8}
              >
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={close}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}

        {resetLink ? (
          <div className="border-t-2 border-border pt-3">
            <LinkPanel
              heading={
                resetLink.kind === "invite"
                  ? `Invite link for ${user.name || user.email}`
                  : `Reset link for ${user.name || user.email}`
              }
              message={
                resetLink.kind === "invite"
                  ? "Send them this link — it works once and expires in 7 days. They'll use it to choose their own password and sign in. Any earlier link stops working."
                  : "Send them this link — it works once and expires in 3 days. They'll choose a new password; the old one keeps working until they do."
              }
              link={resetLink.link}
            >
              <Button size="sm" variant="secondary" onClick={close}>
                Done
              </Button>
            </LinkPanel>
          </div>
        ) : null}

        {error ? (
          <p className="text-ds-xxs font-medium text-destructive">{error}</p>
        ) : null}
        {notice ? (
          <p className="text-ds-xxs font-medium text-primary" role="status">
            {notice}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
