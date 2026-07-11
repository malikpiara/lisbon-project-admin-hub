"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconMenu } from "@/components/icons/ds-icons";
import { buttonVariants } from "@/components/ui/button";

// Destinations that exist today. The final menu pattern is still being aligned
// with design (Rafael) — labels/targets here are a one-line change once decided.
const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Services & Information", href: "/#services" },
  { label: "Contacts", href: "/#contacts" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  // Whether a team member is signed in. The public site is static, so we can't
  // read the session at render — instead ask Payload's `me` endpoint on mount
  // (the httpOnly session cookie rides along same-origin). Defaults to `false`
  // so logged-out visitors — the common case — see "Log in" with no flash; a
  // signed-in admin gets the dashboard link once the check resolves (well before
  // they open this closed-by-default menu).
  const [authed, setAuthed] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    let active = true;
    fetch("/api/users/me", { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active) setAuthed(Boolean(data?.user));
      })
      .catch(() => {
        /* offline / not signed in — keep the default "Log in" affordance */
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Open menu"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((v) => !v)}
        className={buttonVariants({ variant: "ghost", size: "icon" })}
      >
        <IconMenu className="size-5" />
      </button>

      {open ? (
        <div
          id="site-menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border-2 border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-ds-xs font-medium text-foreground outline-none hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {item.label}
            </Link>
          ))}
          {/* Team session — separated from the public destinations above.
              Signed-in members jump straight to the dashboard; everyone else
              gets the sign-in link. */}
          <div className="my-1 border-t-2 border-border" />
          <Link
            href={authed ? "/admin" : "/login"}
            onClick={() => setOpen(false)}
            className="block rounded-md px-3 py-2 text-ds-xs font-medium text-foreground outline-none hover:bg-secondary focus-visible:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {authed ? "Admin dashboard" : "Log in"}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
