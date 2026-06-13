"use client";

import { useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Item values double as labels so the trigger shows readable text.
const OPTIONS = ["Housing", "Health", "Legal", "Education"];

export function SelectDemo() {
  const [value, setValue] = useState<string>("Housing");
  const [smallValue, setSmallValue] = useState<string>("Legal");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={value} onValueChange={(v) => setValue(v ?? "")}>
        <SelectTrigger className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={smallValue} onValueChange={(v) => setSmallValue(v ?? "")}>
        <SelectTrigger size="sm" className="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value="Education" disabled>
        <SelectTrigger className="w-56">
          <SelectValue />
        </SelectTrigger>
      </Select>
    </div>
  );
}
