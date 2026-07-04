"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import { JetBrains_Mono, Quicksand } from "next/font/google";
import Link from "next/link";

import "./globals.css";
import { StatusScreen } from "@/components/status-screen";
import { buttonVariants } from "@/components/ui/button";
import { IconInfo } from "@/components/icons/ds-icons";

// Last-resort boundary: catches errors thrown in a root layout itself, which
// error.tsx cannot. It REPLACES the root layout, so it must ship its own
// <html>/<body>, global styles, and fonts. metadata exports aren't supported
// here (client component) — use a plain <title>.

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  unstable_retry,
  reset,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
  reset?: () => void;
}) {
  useEffect(() => {
    // TODO: forward to an error-reporting service (e.g. PostHog capture).
    console.error(error);
  }, [error]);

  const retry = unstable_retry ?? reset;

  return (
    <html
      lang="en"
      className={`${jetBrainsMono.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <title>Something went wrong · Lisbon Project</title>
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
      </body>
    </html>
  );
}
