"use client";

import { useEffect, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type DocTabSection = {
  id: string;
  label: string;
  child?: boolean;
};

// Astryx-style page tabs (Overview | Properties). Both panels stay mounted —
// they arrive server-rendered as props — and are toggled with `hidden`, so
// switching tabs never loses interactive state inside examples. The active
// tab syncs to ?tab= so Properties links are shareable, and each tab carries
// its own "On This Page" rail with a scrollspy highlight.
export function DocTabs({
  tabs,
}: {
  tabs: {
    id: string;
    label: string;
    content: ReactNode;
    sections?: DocTabSection[];
  }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const activeSections = tabs.find((t) => t.id === active)?.sections ?? [];

  // Deep-linking: pick up ?tab= after mount (post-hydration, so SSG markup
  // stays deterministic), and write it back on change without navigating.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("tab");
    if (param && tabs.some((t) => t.id === param)) setActive(param);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTab = (id: string) => {
    setActive(id);
    const url = new URL(window.location.href);
    if (id === tabs[0]?.id) url.searchParams.delete("tab");
    else url.searchParams.set("tab", id);
    window.history.replaceState(null, "", url);
  };

  // Scrollspy: highlight the rail item whose section is in the reading zone.
  useEffect(() => {
    if (!activeSections.length) return;
    const elements = activeSections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el != null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setCurrentSection(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -55% 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div>
      <div
        role="tablist"
        aria-label="Component documentation sections"
        className="flex gap-6 border-b-2 border-border"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => selectTab(tab.id)}
            className={cn(
              "-mb-0.5 border-b-2 pb-3 text-ds-s font-bold transition-colors",
              active === tab.id
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className={cn(
          "grid gap-12 pt-10",
          activeSections.length > 0 && "lg:grid-cols-[minmax(0,1fr)_11rem]"
        )}
      >
        <div className="min-w-0">
          {tabs.map((tab) => (
            <div key={tab.id} role="tabpanel" hidden={active !== tab.id}>
              {tab.content}
            </div>
          ))}
        </div>
        {activeSections.length > 0 ? (
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <p className="text-ds-xs font-bold text-muted-foreground">
                On This Page
              </p>
              <nav className="space-y-2">
                {activeSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(section.id)?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      window.history.replaceState(null, "", `#${section.id}`);
                    }}
                    className={cn(
                      "block rounded-lg py-1 text-ds-xs font-medium transition-colors",
                      section.child && "pl-4",
                      currentSection === section.id
                        ? "font-bold text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {section.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
