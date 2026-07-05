import type { ReactNode } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { STYLEGUIDE_NAV_GROUPS } from "./_components/styleguide-docs";
import { MobileNav } from "./_components/mobile-nav";
import { StyleguideNav } from "./_components/styleguide-nav";

export const metadata = {
  title: "Component library",
};

export default function StyleguideLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b-2 border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-[1800px] items-center justify-between gap-6 px-6">
          <div className="flex items-center gap-4">
            <MobileNav groups={STYLEGUIDE_NAV_GROUPS} />
            <Link href="/" className="font-heading text-ds-m font-bold text-brand-dark">
              Lisbon Project
            </Link>
            <nav className="hidden items-center gap-4 text-ds-xs font-bold text-foreground md:flex">
              <Link href="/components">Overview</Link>
              <Link href="/components/button">Components</Link>
              <Link href="/components/home-hero">System</Link>
            </nav>
          </div>

          <Link href="/" className={buttonVariants({ size: "sm", variant: "outline" })}>
            Back to site
          </Link>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1800px] grid-cols-1 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="hidden border-r-2 border-border lg:block">
          <div className="sticky top-20 h-[calc(100dvh-5rem)] overflow-y-auto px-6 py-10">
            <StyleguideNav groups={STYLEGUIDE_NAV_GROUPS} />
          </div>
        </aside>

        <main className="min-w-0 px-6 py-10 lg:px-12">
          {children}
        </main>
      </div>
    </div>
  );
}
