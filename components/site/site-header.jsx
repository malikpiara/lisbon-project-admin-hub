import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { SiteNav } from "@/components/site/site-nav";
import { DONATE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader({ sticky = true } = {}) {
  return (
    <header
      className={cn(
        "z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85",
        sticky && "sticky top-0"
      )}
    >
      <div className="mx-auto flex min-h-[72px] max-w-[1680px] items-center justify-between px-4 py-4 sm:px-6 lg:px-14">
        {/* Admin Hub lockup: the DS asset as drawn in the main menu
            (Figma 3393:7331, "brand" 150×40 at the 56px gutter). One file
            rather than glyph + live text, so the type and spacing are
            exactly the designer's. */}
        <Link href="/" className="inline-flex shrink-0">
          <Image
            src="/admin-hub-logo.svg"
            alt="Admin Hub, lisbon project"
            width={150}
            height={40}
            priority
            unoptimized
            className="h-10 w-auto"
          />
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4">
          <SiteNav />
          <a
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              size: "lg",
              className: "px-4",
            })}
          >
            Donate
          </a>
        </nav>
      </div>
    </header>
  );
}
