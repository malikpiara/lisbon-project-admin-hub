"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// System components are full page sections designed against the viewport, so
// they can't render faithfully inside the doc column (Tailwind breakpoints
// track the window, not the container). Instead each preview loads its bare
// /preview/[slug] route in an iframe — a real viewport at the column's width —
// and can expand to a full-screen iframe, YouTube-style, for the 1:1 view.
export function ExpandablePreview({
  slug,
  height = 640,
}: {
  slug: string;
  // Per-component frame height: short blocks (the header) shouldn't float in
  // dead space, tall pages (articles) deserve a bigger window.
  height?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const src = `/preview/${slug}`;

  // Same-origin iframe: measure the document to decide whether the content
  // scrolls past the frame — if so, show the bottom fade as a scroll signifier.
  const handleLoad = () => {
    setLoaded(true);
    const doc = iframeRef.current?.contentDocument;
    if (doc?.body) {
      setOverflowing(doc.body.scrollHeight > height + 40);
    }
  };

  // Fullscreen: lock page scroll, close on Escape, move focus to the close
  // button so keyboard users aren't stranded behind the overlay.
  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  return (
    <>
      <div className="relative overflow-hidden rounded-lg bg-bg-page ring-2 ring-border">
        {!loaded ? (
          <div
            aria-hidden
            className="absolute inset-0 animate-pulse rounded-lg bg-muted motion-reduce:animate-none"
          />
        ) : null}
        <iframe
          ref={iframeRef}
          src={src}
          title={`${slug} preview`}
          onLoad={handleLoad}
          style={{ height }}
          className={cn(
            "block w-full border-0 transition-opacity duration-200",
            loaded ? "opacity-100" : "opacity-0"
          )}
        />
        {overflowing ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 flex h-20 items-end justify-center rounded-b-lg bg-gradient-to-t from-bg-page to-transparent pb-2"
          >
            <span className="rounded-full bg-card px-3 py-1 text-ds-xxs font-bold text-muted-foreground ring-2 ring-border">
              Scrolls — expand for the full view
            </span>
          </div>
        ) : null}
        <Button
          size="icon-sm"
          variant="secondary"
          aria-label="Expand preview to full screen"
          onClick={() => setExpanded(true)}
          className="absolute right-4 top-4 shadow-sm"
        >
          <Maximize2 />
        </Button>
      </div>
      {expanded
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Full screen component preview"
              className="fixed inset-0 z-[100] bg-bg-page animate-in fade-in-0 zoom-in-95 duration-150 motion-reduce:animate-none"
            >
              <iframe
                src={src}
                title={`${slug} preview (full screen)`}
                className="block size-full border-0"
              />
              <Button
                ref={closeRef}
                size="icon"
                variant="secondary"
                aria-label="Close full screen preview"
                onClick={() => setExpanded(false)}
                className="fixed right-6 top-6 z-[110] shadow-md"
              >
                <X />
              </Button>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
