"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { COMPONENT_TOKENS } from "./color-tokens";

// The full colour reference for the DS, mirroring the Figma token file:
// Primitives → Semantic → per-component tokens. Every swatch is painted from its
// live CSS variable (so it tracks light/dark) and reads its resolved hex back at
// runtime. Direction A "copy-first": each swatch is a copy button with contrast
// feedback; the 208 component tokens stay folded away in a disclosure.

type Token = { name: string; var?: string; hex?: string };
type Group = { title: string; tokens: Token[] };

const ramp = (prefix: string, stops: string[]): Token[] =>
  stops.map((s) => ({ name: `${prefix}-${s}`, var: `--${prefix}-${s}` }));

// Brand's lightest stop is `000` (triple zero), not `0`.
const PRIMITIVES: Group[] = [
  {
    title: "Brand",
    tokens: ramp("brand", ["000", "100", "200", "300", "400", "500", "600", "700", "800", "900", "1000"]),
  },
  {
    title: "Neutral",
    tokens: ramp("neutral", ["100", "200", "300", "400", "500", "600", "700", "800", "900", "1000"]),
  },
  {
    title: "Project areas",
    tokens: [
      { name: "social-care", var: "--project-social-care" },
      { name: "people-culture", var: "--project-people-culture" },
      { name: "community-life", var: "--project-community-life" },
      { name: "education", var: "--project-education" },
      { name: "employability", var: "--project-employability" },
    ],
  },
  {
    title: "Status",
    tokens: [
      { name: "green / positive", var: "--positive" },
      { name: "red / negative", var: "--negative" },
    ],
  },
];

const SEMANTIC: Group[] = [
  {
    title: "Semantic",
    tokens: [
      { name: "background/primary", var: "--bg-primary" },
      { name: "background/secondary", var: "--bg-secondary" },
      { name: "background/tertiary", var: "--bg-tertiary" },
      { name: "text/primary", var: "--text-primary" },
      { name: "text/secondary", var: "--text-secondary" },
      { name: "text/tertiary", var: "--text-tertiary" },
      { name: "brand/primary", var: "--brand-primary" },
      { name: "brand/secondary", var: "--brand-secondary" },
      { name: "brand/tertiary", var: "--brand-tertiary" },
    ],
  },
];

function rgbToHex(rgb: string): string {
  const m = rgb.match(/[\d.]+/g);
  if (!m || m.length < 3) return rgb;
  const hex = m
    .slice(0, 3)
    .map((x) => Math.round(Number(x)).toString(16).padStart(2, "0"))
    .join("");
  return `#${hex.toUpperCase()}`;
}

function bgValue(t: Token): string {
  return t.var ? `var(${t.var})` : t.hex || "transparent";
}

// WCAG relative luminance + best achievable text contrast on this colour, so each
// swatch can answer "can I put text on this?" — the question a contributor has.
function relLuminance(hex: string): number | null {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const lin = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

// Contrast is a property of a pair, not a single swatch — every colour can carry
// either black or white text at AA or better (the global floor is ~4.58:1). So
// rather than a meaningless per-swatch grade, we report which text colour works
// best on this swatch and its ratio, on demand via the tooltip.
function bestText(hex: string): { ratio: number; useDark: boolean; grade: string } | null {
  const L = relLuminance(hex);
  if (L == null) return null;
  const vsBlack = (L + 0.05) / 0.05;
  const vsWhite = 1.05 / (L + 0.05);
  const useDark = vsBlack >= vsWhite;
  const ratio = useDark ? vsBlack : vsWhite;
  const grade = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : "AA Large";
  return { ratio, useDark, grade };
}

function useCopyFeedback() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  const copy = (text: string, key: string) => {
    try {
      navigator.clipboard?.writeText(text);
    } catch {
      // clipboard may be unavailable; the visual feedback still fires
    }
    setCopied(key);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1200);
  };
  return { copied, copy };
}

function Swatch({ token, compact = false }: { token: Token; compact?: boolean }) {
  const bgRef = useRef<HTMLSpanElement>(null);
  const [hex, setHex] = useState("");
  const { copied, copy } = useCopyFeedback();

  // Read the resolved hex once mounted. Re-runs when the swatch becomes visible
  // (e.g. the component-tokens disclosure opens) since a hidden read can be empty.
  useEffect(() => {
    const el = bgRef.current;
    if (!el) return;
    const read = () => {
      const v = rgbToHex(getComputedStyle(el).backgroundColor);
      if (/^#[0-9A-F]{6}$/.test(v)) setHex(v);
    };
    read();
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) read();
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const text = hex ? bestText(hex) : null;
  const varText = token.var ? `var(${token.var})` : null;

  // Plain click copies the hex (designers/Figma); Alt-click copies the CSS
  // variable (developers). Both are spelled out in the tooltip.
  const handleClick = (e: MouseEvent) => {
    if (e.altKey && varText) {
      copy(varText, "var");
      return;
    }
    const value =
      hex || rgbToHex(getComputedStyle(bgRef.current!).backgroundColor);
    if (/^#[0-9A-F]{6}$/i.test(value)) copy(value, "hex");
  };

  return (
    <div className="group min-w-0 overflow-hidden rounded-lg border-2 border-border bg-card transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              type="button"
              onClick={handleClick}
              aria-label={`Copy hex for ${token.name}`}
              className={cn(
                "relative block w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                compact ? "h-11" : "h-16"
              )}
            >
              <span
                ref={bgRef}
                aria-hidden="true"
                className="absolute inset-0"
                style={{ background: bgValue(token) }}
              />
              <span
                className={cn(
                  "pointer-events-none absolute inset-0 flex items-center justify-center bg-brand-link text-ds-xxs font-bold text-brand-000 transition-opacity duration-150",
                  copied ? "opacity-100" : "opacity-0"
                )}
              >
                {copied === "var" ? "Copied variable" : "Copied hex"}
              </span>
            </button>
          }
        />
        <TooltipContent>
          {compact ? (
            <p className="font-mono text-ds-xxs font-bold text-background">
              {hex || "…"}
            </p>
          ) : null}
          {varText ? (
            <p className="font-mono text-ds-xxs text-background">{varText}</p>
          ) : null}
          {text ? (
            <p className="text-ds-xxs text-background/70">
              Best text: {text.useDark ? "dark" : "light"} · {text.grade} (
              {text.ratio.toFixed(1)}:1)
            </p>
          ) : null}
          <p className="text-ds-xxs text-background/70">
            Click: hex{varText ? " · ⌥: variable" : ""}
          </p>
        </TooltipContent>
      </Tooltip>

      <div className="border-t border-border px-2.5 py-2">
        <p className="font-mono text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground [overflow-wrap:anywhere]">
          {token.name}
        </p>
        {!compact ? (
          <p className="mt-0.5 font-mono text-ds-xxs font-bold text-foreground [overflow-wrap:anywhere]">
            {hex || "…"}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function SwatchGrid({ tokens, compact }: { tokens: Token[]; compact?: boolean }) {
  return (
    <div
      className={cn(
        "grid gap-3",
        compact
          ? "grid-cols-3 sm:grid-cols-5 lg:grid-cols-8"
          : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6"
      )}
    >
      {tokens.map((token, i) => (
        <Swatch key={`${token.name}-${i}`} token={token} compact={compact} />
      ))}
    </div>
  );
}

export function ColorGrid() {
  return (
    <TooltipProvider>
      <div className="space-y-10">
        {[...PRIMITIVES, ...SEMANTIC].map((group) => (
        <div
          key={group.title}
          id={group.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
          className="scroll-mt-28"
        >
          <p className="mb-3 text-ds-xs font-bold text-foreground">{group.title}</p>
          <SwatchGrid tokens={group.tokens} />
        </div>
      ))}

      <details id="component-tokens" className="group scroll-mt-28 rounded-lg border-2 border-border">
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-ds-xs font-bold text-foreground [&::-webkit-details-marker]:hidden">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="size-4 shrink-0 transition-transform group-open:rotate-90"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
          Component tokens
          <span className="font-medium text-muted-foreground">
            — 208 entries across 27 components
          </span>
        </summary>
        <div className="space-y-7 px-4 pt-1 pb-5">
          {COMPONENT_TOKENS.map((group) => (
            <div key={group.component}>
              <p className="mb-2.5 font-mono text-ds-xxs font-bold text-brand-link">
                {group.component}
              </p>
              <SwatchGrid tokens={group.tokens} compact />
            </div>
          ))}
        </div>
      </details>
      </div>
    </TooltipProvider>
  );
}
