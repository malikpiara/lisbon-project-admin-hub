import type { ReactNode } from "react";
import Link from "next/link";

import { GalleryShell } from "./_components/gallery-shell";
import { SECTIONS } from "./_components/sections";

export const metadata = {
  title: "Component gallery · Lisbon Project",
};

export default function StyleguideLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-border px-4 py-6 md:flex">
        <Link href="/" className="px-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          ← Back to site
        </Link>
        <nav className="mt-6 flex flex-col gap-0.5">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </aside>

      <GalleryShell>{children}</GalleryShell>
    </div>
  );
}
