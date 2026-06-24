"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react";

// PostHog is opt-in: it only initialises when NEXT_PUBLIC_POSTHOG_KEY is set, so
// the app runs fine (no-op) before the Lisbon Project project exists. EU cloud by
// default (the account is on eu.posthog.com).
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!KEY || posthog.__loaded) return;
    posthog.init(KEY, {
      api_host: HOST,
      // App Router doesn't fire SPA pageviews reliably; we capture them manually
      // in <PageviewTracker> below.
      capture_pageview: false,
      capture_pageleave: true,
      // Privacy: don't create person profiles for anonymous visitors (lighter
      // GDPR footprint for a public NGO site). Revisit if/when members log in.
      person_profiles: "identified_only",
      // No session replay on a site for vulnerable users — the PostHog project
      // has recording on by default; opt out at the client. Enable later w/ consent.
      disable_session_recording: true,
    });
  }, []);

  // Not configured yet → render children untouched (usePostHog() returns null,
  // so capture calls elsewhere are safe no-ops).
  if (!KEY) return <>{children}</>;

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}

// Manual $pageview on every App Router navigation (path + query string).
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ph = usePostHog();

  useEffect(() => {
    if (!pathname || !ph) return;
    let url = window.location.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += `?${qs}`;
    ph.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, ph]);

  return null;
}
