"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Script from "next/script";
import { usePostHog } from "posthog-js/react";

import { IconChatBot } from "@/components/icons/ds-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const CHATBOT_ID = "cmeqzl2cf001e10atrngwijr8";

// DS chatbot launcher, Figma node 3200:6506. The orange (#F57600) is specific to
// this node — it is not part of the shared DS palette, so it lives here inline.
const LAUNCHER_ORANGE = "#F57600";

function subscribe() {
  return () => {};
}

// We render our OWN launcher + panel and embed Zapier in `is-popup="false"`
// (inline) mode, so the floating button, its opening animation, and the panel
// chrome are all ours — matching the DS spec. Zapier still drives the chat
// itself. The embed is mounted only on first open, so its bundle never loads
// for visitors who don't open the chat.
//
// This is also the page shell: it wraps the site body so that on desktop the
// open panel can *push* the content left (the body gets `md:mr-[--chat-w]`).
// The panel width and the push margin must stay equal — both are 380px.
export function SiteChatShell({ children }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [loaded, setLoaded] = useState(false); // Zapier embed mounted (kept once true)
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef(null);
  const launcherRef = useRef(null);
  // Null until PostHog is configured (opt-in, guarded on the env key). We only
  // log *engagement* here — the questions themselves live in Zapier's
  // cross-origin iframe and are captured server-side (see docs/ANALYTICS.md).
  const posthog = usePostHog();

  const close = useCallback(() => {
    setOpen(false);
    // Hand focus back to the launcher — otherwise it dies inside the now-inert
    // panel and keyboard users are stranded.
    launcherRef.current?.focus();
    posthog?.capture("chatbot_closed");
  }, [posthog]);

  // Defined in render so it reads the current `open`/`loaded`, and — crucially —
  // performs no state update inside another setter's updater. React's dev
  // StrictMode double-invokes updater functions to flag impure ones; a nested
  // `setOpen(o => !o)` would run twice and cancel itself, breaking reopen.
  function toggle() {
    if (open) {
      close();
      return;
    }
    if (!loaded) {
      // First open: mount the embed closed, then flip open next frame so the
      // entrance transition actually plays.
      setLoaded(true);
      requestAnimationFrame(() => setOpen(true));
    } else {
      setOpen(true);
    }
    posthog?.capture("chatbot_opened");
  }

  // Close on Escape and move focus to the close button when the panel opens.
  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    function onKeyDown(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  return (
    <>
      {/* Page body — shrinks on desktop when the panel is open, so the sidebar
          pushes content left rather than overlaying it. `380px` matches the
          panel width below; keep them equal. No push below `md` (mobile card). */}
      <div
        className={cn(
          "flex min-h-dvh flex-col transition-[margin] duration-200 ease-out motion-reduce:transition-none",
          mounted && open && "md:mr-[380px]",
        )}
      >
        {children}
      </div>

      {/* The launcher + panel only exist once mounted (client-only, needs refs
          and the Zapier embed). Until then we still render the body above so
          the server/client markup for the page content matches. */}
      {!mounted ? null : (
        <>
      {/* Launcher — 50px circle, hidden while the panel is open. We pass our own
          <button> via Base UI's `render` prop (NOT props on TooltipTrigger): that
          keeps React binding onClick/ref to *our* element, while the Trigger merges
          its hover/focus behavior on top. Tooltip stays closed while the panel is
          open (launcher is pointer-events-none). */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                ref={launcherRef}
                type="button"
                onClick={toggle}
                aria-label="Abrir o chat de ajuda"
                aria-expanded={open}
                style={{ backgroundColor: LAUNCHER_ORANGE }}
                className={cn(
                  "fixed right-6 bottom-6 z-[60] grid size-[50px] cursor-pointer place-items-center rounded-full text-white",
                  "shadow-[0_4px_4px_0_#BDBDBD] transition-[transform,opacity,filter] duration-200 ease-out",
                  "hover:brightness-105 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#F57600]/40",
                  "motion-reduce:transition-none",
                  open && "pointer-events-none scale-90 opacity-0",
                )}
              >
                <IconChatBot className="size-[22px]" />
              </button>
            }
          />
          <TooltipContent side="left">Need help?</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Panel — mounted on first open, kept mounted so the chat is preserved */}
      {loaded && (
        <div
          role="dialog"
          aria-label="Chat de ajuda"
          // `inert` (not just aria-hidden): the Zapier iframe keeps focusable
          // content while the panel is visually closed — inert blocks tabbing
          // into it and removes it from the a11y tree in one go.
          inert={!open}
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden bg-card",
            // Mobile: full-screen sheet — fills the viewport, edge to edge.
            "inset-0 h-dvh w-full rounded-none border-0",
            // Desktop: full-height sidebar docked flush to the right edge.
            "md:left-auto md:w-[380px] md:border-l md:border-border",
            // Mobile sheet slides up from the bottom; desktop sidebar slides in from the right.
            "transition-[transform,opacity] duration-200 ease-out motion-reduce:transition-none",
            open
              ? "translate-y-0 opacity-100 md:translate-x-0"
              : "pointer-events-none translate-y-full opacity-0 md:translate-y-0 md:translate-x-full",
          )}
        >
          <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
            <span className="flex items-center gap-2">
              <IconChatBot className="size-5" style={{ color: LAUNCHER_ORANGE }} />
              <span className="text-ds-s font-bold text-foreground">Assistente</span>
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              aria-label="Fechar o chat"
              className="grid size-8 cursor-pointer place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="min-h-0 flex-1">
            <Script
              id="zapier-interfaces"
              type="module"
              src="https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js"
              strategy="afterInteractive"
            />
            <zapier-interfaces-chatbot-embed
              is-popup="false"
              chatbot-id={CHATBOT_ID}
              style={{ width: "100%", height: "100%" }}
            ></zapier-interfaces-chatbot-embed>
          </div>
        </div>
      )}
        </>
      )}
    </>
  );
}
