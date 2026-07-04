"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import Link from "next/link";

import { StatusScreen } from "@/components/status-screen";
import { buttonVariants } from "@/components/ui/button";
import { IconInfo } from "@/components/icons/ds-icons";

// Runtime error boundary for the (frontend) tree (public site, admin, login).
// Renders inside the (frontend) root layout, so it inherits fonts + globals.
// Errors in the root layout itself are handled by app/global-error.tsx.
export default function Error({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string };
  // `unstable_retry` (Next 16.2+) re-fetches and re-renders the segment and
  // supersedes the older `reset`, which we keep as a graceful fallback.
  unstable_retry?: () => void;
  reset?: () => void;
}) {
  useEffect(() => {
    // TODO: forward to an error-reporting service (e.g. PostHog capture).
    console.error(error);
  }, [error]);

  const retry = unstable_retry ?? reset;

  return (
    <StatusScreen
      icon={IconInfo}
      title="Something went wrong"
      description="An unexpected error came up on our end. You can try again, or head back to the homepage."
    >
      <button
        type="button"
        onClick={() => retry?.()}
        className={buttonVariants()}
      >
        Try again
      </button>
      <Link href="/" className={buttonVariants({ variant: "secondary" })}>
        Back to homepage
      </Link>
    </StatusScreen>
  );
}
