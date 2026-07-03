"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StyleguideNav, type StyleguideNavGroup } from "./styleguide-nav";

// Below lg the sidebar disappears — without this, component pages are a
// navigation dead-end on mobile. Opens the same searchable nav as a slide-over.
export function MobileNav({ groups }: { groups: StyleguideNavGroup[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close when a nav link navigates.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <Button
        size="icon-sm"
        variant="secondary"
        aria-label="Browse components"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="lg:hidden"
      >
        <Menu />
      </Button>
      {open
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Component navigation"
              className="fixed inset-0 z-[100] lg:hidden"
            >
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className="absolute inset-0 bg-brand-dark/25 animate-in fade-in-0 duration-150 motion-reduce:animate-none"
              />
              <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw] overflow-y-auto bg-background p-6 shadow-xl animate-in slide-in-from-left duration-200 motion-reduce:animate-none">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <p className="font-heading text-ds-s font-bold text-foreground">
                    Component library
                  </p>
                  <Button
                    ref={closeRef}
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Close navigation"
                    onClick={() => setOpen(false)}
                  >
                    <X />
                  </Button>
                </div>
                <StyleguideNav groups={groups} />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
