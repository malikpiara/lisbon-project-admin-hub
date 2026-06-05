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

  return (
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
  );
}
