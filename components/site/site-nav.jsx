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
  { label: "Calendar", href: "/calendar" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

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
        </div>
      ) : null}
    </div>
  );
}
