import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  IconAdminHubLogo,
  IconLisbonBrandMark,
} from "@/components/icons/ds-icons";
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
        {/* Admin Hub lockup — DS logo 3112:9963: magnifier-house glyph +
            "Admin Hub" in brand teal, endorsed by the mini brand mark +
            "lisbon project" in brand dark. */}
        <Link
          href="/"
          aria-label="Admin Hub home"
          className="inline-flex items-center gap-2.5"
        >
          <IconAdminHubLogo className="size-10 shrink-0 text-primary" />
          <span className="flex flex-col leading-none">
            <span className="text-[19px] font-bold text-primary">
              Admin Hub
            </span>
            <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-normal text-brand-dark">
              <IconLisbonBrandMark className="size-3 shrink-0" />
              <span>
                <span className="font-bold">lisbon</span> project
              </span>
            </span>
          </span>
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
