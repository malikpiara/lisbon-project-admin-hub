import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
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
        <Link
          href="/"
          aria-label="Admin Hub home"
          className="inline-flex items-center gap-2.5 overflow-hidden"
        >
          <span className="relative block h-10 w-10 shrink-0 overflow-hidden">
            <Image
              src="/lisbon-project-logo.svg"
              alt=""
              width={108}
              height={43}
              priority
              aria-hidden="true"
              className="absolute left-0 top-0 h-10 w-[101px] max-w-none"
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[19px] font-bold text-brand-dark">
              Admin hub
            </span>
            <span className="mt-1 text-[15px] font-normal text-primary">
              <span className="font-bold">lisbon</span> project
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            aria-label="Open menu"
            className={buttonVariants({ size: "icon" })}
          >
            <Menu className="size-5" strokeWidth={1.9} />
          </button>
          <Link
            href="/donate"
            className={buttonVariants({
              size: "lg",
              className: "px-4",
            })}
          >
            Donate
          </Link>
        </nav>
      </div>
    </header>
  );
}
