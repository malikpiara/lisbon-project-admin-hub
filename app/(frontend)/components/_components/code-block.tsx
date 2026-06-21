"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { highlightCode } from "@/lib/highlight-code";
import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const lines = code.split("\n");

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(code);
      ok = true;
    } catch {
      // Fallback for contexts where the async Clipboard API is unavailable.
      try {
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <div
      className={cn(
        "group/code relative overflow-hidden rounded-lg bg-muted ring-1 ring-border",
        className
      )}
    >
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-lg bg-muted/80 text-muted-foreground backdrop-blur transition-colors hover:bg-background hover:text-foreground"
      >
        {copied ? (
          <Check className="size-4 text-primary" />
        ) : (
          <Copy className="size-4" />
        )}
      </button>

      <div className="flex text-ds-xs leading-relaxed">
        <div
          aria-hidden
          className="shrink-0 select-none border-r-2 border-border/70 py-3 pl-4 pr-3 text-right font-mono text-muted-foreground/55"
        >
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="min-w-0 flex-1 overflow-x-auto py-3 pl-4 pr-12 font-mono">
          <code
            dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
          />
        </pre>
      </div>
    </div>
  );
}
