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

// The brand-link "changed since saved" marker. Shared so every field signal —
// text inputs (via Field), checkboxes, anywhere — uses the identical dot.
// Pass `className` for spacing (Field uses ml-1.5; flex labels rely on gap).
export function DirtyDot({ className = "" }) {
  return (
    <span
      className={`inline-block size-1.5 rounded-full bg-brand-link align-middle ${className}`}
      aria-hidden
    />
  );
}

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
  // When true, the field differs from its last-saved value: soft mint wash on
  // the control + a brand-link dot on the label. Focus still wins the border
  // (turns teal via focus-visible:border-ring), so "editing now" stays distinct
  // from "changed earlier".
  dirty = false,
  className = "",
}) {
  const wash = dirty ? "border-brand-300 bg-muted" : "";
  return (
    <label className={`block ${className}`}>
      <span className={labelClass}>
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        ) : null}
        {dirty ? <DirtyDot className="ml-1.5" /> : null}
      </span>
      {textarea ? (
        <Textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={wash}
        />
      ) : (
        <Input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={wash}
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

// `options` accepts plain strings (value === label) or { value, label } objects.
// Base UI's Select shows the raw value in the trigger unless it gets a value→label
// `items` map, so we pass one whenever a label differs from its value (e.g. a
// service shown by title but stored by id). String-only callers are unaffected.
export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
  dirty = false,
  placeholder = "Select…",
  className = "",
}) {
  const normalized = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );
  const items = normalized.some((o) => o.value !== o.label)
    ? Object.fromEntries(normalized.map((o) => [o.value, o.label]))
    : undefined;
  return (
    <div className={`block ${className}`}>
      <span className={labelClass}>
        {label}
        {dirty ? <DirtyDot className="ml-1.5" /> : null}
      </span>
      <Select items={items} value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {normalized.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {hint ? (
        <span className="mt-1 block text-ds-xxs font-medium text-muted-foreground">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
