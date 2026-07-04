import Link from "next/link";

import { StatusScreen } from "@/components/status-screen";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Page not found · Lisbon Project",
};

// Rendered when a frontend route calls notFound() (e.g. an unknown service or
// topic id, a missing preview slug). Renders inside the (frontend) root layout.
// Truly-unmatched URLs are handled app-wide by app/global-not-found.tsx.
export default function NotFound() {
  return (
    <StatusScreen
      code="404"
      title="Page not found"
      description="The page you're looking for may have moved, or it never existed. Let's get you back on track."
    >
      <Link href="/" className={buttonVariants()}>
        Back to homepage
      </Link>
      <Link
        href="/services"
        className={buttonVariants({ variant: "secondary" })}
      >
        Browse services
      </Link>
    </StatusScreen>
  );
}
