"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Client shell for the gallery: sticky top bar with a scoped dark-mode toggle.
 * The `dark` class is applied to a wrapper element so only the preview area
 * flips theme (globals.css uses `@custom-variant dark (&:is(.dark *))`, which
 * targets descendants of `.dark`). The top bar stays light for a stable control.
 */
export function GalleryShell({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  return (
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-8 py-4 backdrop-blur">
        <div>
          <h1 className="font-heading text-lg font-semibold">Component gallery</h1>
          <p className="text-sm text-muted-foreground">
            Lisbon Project design system
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDark((v) => !v)}
          aria-pressed={dark}
        >
          {dark ? <Sun /> : <Moon />}
          {dark ? "Light" : "Dark"}
        </Button>
      </header>

      <div className={cn(dark && "dark")}>
        <div className="min-h-[70vh] bg-background text-foreground">
          <div className="mx-auto max-w-4xl px-8 py-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
