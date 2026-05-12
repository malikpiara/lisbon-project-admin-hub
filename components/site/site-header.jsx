import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Lisbon Project home"
          className="inline-flex items-center"
        >
          <Image
            src="/lisbon-project-logo.svg"
            alt="Lisbon Project"
            width={108}
            height={43}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            <ChevronDown className="size-4" />
            Menu
          </button>
          <button
            type="button"
            aria-label="Search"
            className="grid size-9 place-items-center rounded-full text-primary hover:bg-accent hover:text-primary/80"
          >
            <Search className="size-4" />
          </button>
          <Link
            href="/donate"
            className={buttonVariants({
              size: "lg",
              className: "rounded-full px-5 tracking-wide",
            })}
          >
            DONATE
          </Link>
        </nav>
      </div>
    </header>
  );
}
