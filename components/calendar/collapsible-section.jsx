"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function CollapsibleSection({ title, subtitle, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mb-8">
      <div className="border-b-2 border-border">
        <CollapsibleTrigger className="w-full flex items-center justify-between gap-4 py-3 text-left hover:opacity-80 transition-opacity">
          <h2 className="font-heading text-ds-l font-bold text-foreground">{title}</h2>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-primary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        {subtitle && <p className="-mt-1 pb-3 text-ds-xxs font-medium text-muted-foreground">{subtitle}</p>}
      </div>
      <CollapsibleContent className="pt-4">{children}</CollapsibleContent>
    </Collapsible>
  );
}
