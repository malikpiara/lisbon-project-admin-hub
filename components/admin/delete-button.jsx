"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Inline two-step delete confirm — prevents accidental data loss without a
// modal interrupt. First click "arms" the action; a second confirms, or cancel.
export function DeleteButton({ onConfirm, label = "Delete", className = "" }) {
  const [armed, setArmed] = useState(false);

  if (armed) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-ds-xxs font-medium text-muted-foreground">
          Delete this?
        </span>
        <Button variant="ghost" size="sm" onClick={() => setArmed(false)}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onConfirm}
          className="bg-destructive text-white hover:bg-destructive/90 disabled:opacity-100"
        >
          Delete
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setArmed(true)}
      className={cn("text-destructive hover:text-destructive", className)}
    >
      <Trash2 />
      {label}
    </Button>
  );
}
