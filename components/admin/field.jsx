"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const labelClass = "mb-1.5 block text-ds-xs font-medium text-foreground";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
  rows = 3,
  hint,
  required = false,
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      <span className={labelClass}>
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        ) : null}
      </span>
      {textarea ? (
        <Textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      ) : (
        <Input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
      {hint ? (
        <span className="mt-1 block text-ds-xxs font-medium text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export function SelectField({ label, value, onChange, options, className = "" }) {
  return (
    <div className={`block ${className}`}>
      <span className={labelClass}>{label}</span>
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
