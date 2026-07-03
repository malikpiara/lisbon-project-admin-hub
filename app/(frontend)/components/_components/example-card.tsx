"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

// Astryx-style example card: title bar, centered live preview, and a footer
// where Description and Code sit behind tabs instead of stacking vertically.
// Preview/code arrive server-rendered as ReactNodes.
export function ExampleCard({
  id,
  title,
  preview,
  description,
  code,
  align = "center",
}: {
  id: string;
  title: string;
  preview: ReactNode;
  description?: string;
  code?: ReactNode;
  // Center control clusters; left-align block-level examples (tables, lists)
  // that read wrong centered.
  align?: "center" | "start";
}) {
  const tabs = [
    ...(description ? (["description"] as const) : []),
    ...(code ? (["code"] as const) : []),
  ];
  const [active, setActive] = useState<"description" | "code">(
    description ? "description" : "code"
  );

  return (
    <section
      id={id}
      className="scroll-mt-28 overflow-hidden rounded-lg ring-2 ring-border"
    >
      <div className="border-b-2 border-border bg-card px-5 py-3">
        <h3 className="font-heading text-ds-xs font-bold text-foreground">
          {title}
        </h3>
      </div>
      <div
        className={cn(
          "grid min-h-44 bg-card p-8",
          align === "center" ? "place-items-center" : "items-center"
        )}
      >
        <div
          className={cn(
            "w-full",
            align === "center" && "max-w-2xl [&>*]:mx-auto"
          )}
        >
          {preview}
        </div>
      </div>
      {tabs.length ? (
        <div className="border-t-2 border-border bg-card">
          <div className="flex items-center gap-5 px-5 pt-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActive(tab)}
                className={cn(
                  "border-b-2 pb-2 text-ds-xxs font-bold capitalize transition-colors",
                  active === tab
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="px-5 pb-4 pt-3">
            {active === "description" && description ? (
              <p className="max-w-3xl text-ds-xs font-medium text-muted-foreground">
                {description}
              </p>
            ) : null}
            {active === "code" && code ? code : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
