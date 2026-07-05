import { JetBrains_Mono, Quicksand } from "next/font/google";

import "./globals.css";
import { StatusScreen } from "@/components/status-screen";
import { buttonVariants } from "@/components/ui/button";

// App-wide 404 for URLs that match no route. Because this app has TWO root
// layouts ((frontend) and (payload)) there is no single root layout Next can
// compose a normal not-found from, so the framework needs global-not-found.
// (Enabled via experimental.globalNotFound in next.config.mjs — see the Next 16
// not-found.js docs.) It bypasses layouts entirely, so it must ship its own
// <html>/<body>, global styles, and fonts.

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata = {
  title: "Page not found · Lisbon Project",
  description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html
      lang="en"
      className={`${jetBrainsMono.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <StatusScreen
          code="404"
          title="Page not found"
          description="The page you're looking for may have moved, or it never existed. Let's get you back on track."
        >
          {/* Plain <a> (not next/link): global-not-found renders outside the app
              router's root layouts, so a soft navigation would change the URL
              without rendering the target. A full document load is correct here. */}
          <a href="/" className={buttonVariants()}>
            Back to homepage
          </a>
          <a
            href="/services"
            className={buttonVariants({ variant: "secondary" })}
          >
            Browse services
          </a>
        </StatusScreen>
      </body>
    </html>
  );
}
