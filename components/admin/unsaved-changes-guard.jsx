"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

// Guards against losing unsaved edits — important for non-technical editors who
// click around freely. Three layers:
//   1. In-app navigation (sidebar links, breadcrumbs, any <a>) → DS modal.
//   2. Tab close / reload / hard navigation → the browser's native beforeunload.
// The App Router has no built-in navigation blocker, so we intercept anchor
// clicks in the capture phase before Next's <Link> handles them. (Browser
// back/forward within the SPA isn't covered — a known further enhancement.)
export function UnsavedChangesGuard({ when }) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState(null);
  const whenRef = useRef(when);
  // Sync in an effect, not during render — a render-phase ref write can tear
  // under concurrent rendering (and the react-hooks lint errors on it). Click
  // and beforeunload handlers only fire after effects run, so this is safe.
  useEffect(() => {
    whenRef.current = when;
  }, [when]);
  const bypassRef = useRef(false);

  // Tab close / reload / hard navigation.
  useEffect(() => {
    const handler = (e) => {
      if (whenRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // In-app anchor navigation — intercept before Next's <Link> runs.
  useEffect(() => {
    const onClick = (e) => {
      if (!whenRef.current || bypassRef.current) return;
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = e.target.closest?.("a[href]");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return; // external — let it go
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return; // same page
      }
      e.preventDefault();
      e.stopPropagation();
      setPendingHref(url.pathname + url.search + url.hash);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Escape closes the modal (= stay).
  useEffect(() => {
    if (!pendingHref) return;
    const onKey = (e) => {
      if (e.key === "Escape") setPendingHref(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingHref]);

  if (!pendingHref) return null;

  const stay = () => setPendingHref(null);
  const leave = () => {
    const href = pendingHref;
    setPendingHref(null);
    bypassRef.current = true;
    router.push(href);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsaved-title"
      className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm"
      onClick={stay}
    >
      <div
        className="w-full max-w-md rounded-lg border-2 border-border bg-card p-6 shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="unsaved-title"
          className="font-heading text-ds-l font-bold text-foreground"
        >
          Leave without saving?
        </h2>
        <p className="mt-2 text-ds-xs font-medium text-muted-foreground">
          Your changes haven&rsquo;t been saved. If you leave now, you&rsquo;ll
          lose them.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={stay}>
            Stay on this page
          </Button>
          <Button size="sm" onClick={leave}>
            Leave anyway
          </Button>
        </div>
      </div>
    </div>
  );
}
