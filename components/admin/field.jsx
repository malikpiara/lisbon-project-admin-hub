"use client";

import { ChevronDown } from "lucide-react";
import { Menu } from "@base-ui/react/menu";
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

// A free-text heading field with a preset dropdown. Editors type any heading
// (via the Input) or pick a standard one from the chevron menu. Typing calls
// `onChange`; picking a preset calls `onPickPreset(preset)` — the caller uses
// that distinct signal to also apply preset side effects (e.g. flip a section
// to a numbered list) without second-guessing every keystroke.
export function HeadingComboField({
  label,
  value,
  onChange,
  onPickPreset,
  presets = [],
  placeholder,
  required = false,
  dirty = false,
  className = "",
}) {
  const wash = dirty ? "border-brand-300 bg-muted" : "";
  return (
    <div className={`block ${className}`}>
      <span className={labelClass}>
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        ) : null}
        {dirty ? <DirtyDot className="ml-1.5" /> : null}
      </span>
      <div className="relative">
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-11 ${wash}`}
        />
        <Menu.Root>
          <Menu.Trigger
            aria-label="Choose a standard heading"
            className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ChevronDown className="size-4" strokeWidth={2} />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner
              side="bottom"
              align="end"
              sideOffset={4}
              className="isolate z-50"
            >
              <Menu.Popup className="max-h-(--available-height) min-w-56 origin-(--transform-origin) overflow-y-auto rounded-lg border-2 border-border bg-popover p-1 text-popover-foreground shadow-md">
                {presets.map((preset) => (
                  <Menu.Item
                    key={preset}
                    onClick={() => onPickPreset?.(preset)}
                    className="flex w-full cursor-default items-center rounded-xl px-3 py-2 text-ds-xs font-medium outline-hidden select-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                  >
                    {preset}
                  </Menu.Item>
                ))}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
    </div>
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
