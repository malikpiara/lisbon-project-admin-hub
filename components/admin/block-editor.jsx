"use client";

import { useEffect, useRef, useState } from "react";
// DS lacks link + trash glyphs — interim lucide icons, flagged for Rafael.
import { Link2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconNotes,
  IconMenu,
  IconArrowRight,
  IconArrowDown,
  IconPlus,
} from "@/components/icons/ds-icons";
import { cn } from "@/lib/utils";

// Stable client-only keys per block / table row so React reconciles and the
// dirty-diff (countChanges, which matches by `_k`) doesn't light up on reorder.
let _blkSeq = 0;
const nextBlockKey = () => `blk${_blkSeq++}`;

const splitL = (s) =>
  (s || "")
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

// Validate + normalise a web address for the "Add link" tool. Accepts full
// http(s) URLs, mailto:/tel:, internal /paths, and bare domains (auto-prefixed
// with https://). Rejects a bare word (e.g. "test") or an unsafe scheme.
export function normUrl(v) {
  v = (v || "").trim();
  if (!v) return null;
  if (v[0] === "/") return v;
  if (/^(mailto:|tel:)/i.test(v)) return v;
  try {
    const u = new URL(v);
    if (/^https?:$/i.test(u.protocol)) return v;
    return null;
  } catch {
    /* not a full URL — try as a bare domain below */
  }
  if (/^[^\s.]+\.[^\s]{2,}/.test(v)) {
    try {
      const u = new URL("https://" + v);
      if (u.hostname.includes(".")) return "https://" + v;
    } catch {
      /* still invalid */
    }
  }
  return null;
}

// A provisional table glyph — the DS has no table icon yet (Rafael to add one),
// so this is deliberately outlined (lighter) than the filled DS icons.
function TableGlyph({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="4.5" width="18" height="15" rx="2.5" />
      <path d="M3 10h18M10 4.5v15" />
    </svg>
  );
}

const BLOCK_META = {
  text: { label: "Text", desc: "A paragraph", Icon: IconNotes },
  list: { label: "List", desc: "Bulleted or numbered", Icon: IconMenu },
  table: { label: "Table", desc: "Two-column reference", Icon: TableGlyph },
  button: { label: "Button", desc: "A call to action", Icon: IconArrowRight },
};
const BLOCK_TYPES = ["text", "list", "table", "button"];

export function emptyBlock(type) {
  const _k = nextBlockKey();
  if (type === "text") return { _k, type, body: "" };
  if (type === "list") return { _k, type, ordered: false, items: "" };
  if (type === "table")
    return { _k, type, title: "", rows: [{ _k: nextBlockKey(), label: "", items: "" }] };
  return { _k, type, label: "", href: "" };
}

// Payload section (blocks OR deprecated fields) → editor blocks. `items` become
// newline strings the textareas edit. Synthesises from body/bullets/table/cta
// when a section predates the blocks field, so old content edits seamlessly.
export function blocksFromPayload(s) {
  const raw = s.blocks ?? [];
  if (raw.length) {
    return raw
      .map((b) => {
        const _k = nextBlockKey();
        if (b.blockType === "text") return { _k, type: "text", body: b.text ?? "" };
        if (b.blockType === "list")
          return {
            _k,
            type: "list",
            ordered: !!b.ordered,
            items: (b.items ?? []).map((i) => i.text).join("\n"),
          };
        if (b.blockType === "table")
          return {
            _k,
            type: "table",
            title: b.title ?? "",
            rows: (b.rows ?? []).map((r) => ({
              _k: nextBlockKey(),
              label: r.label ?? "",
              items: (r.items ?? []).map((i) => i.text).join("\n"),
            })),
          };
        if (b.blockType === "button")
          return { _k, type: "button", label: b.label ?? "", href: b.href ?? "" };
        return null;
      })
      .filter(Boolean);
  }
  const out = [];
  if ((s.body ?? "").trim()) out.push({ _k: nextBlockKey(), type: "text", body: s.body });
  const bullets = (s.bullets ?? []).map((b) => b.text).filter(Boolean);
  if (bullets.length)
    out.push({ _k: nextBlockKey(), type: "list", ordered: !!s.ordered, items: bullets.join("\n") });
  const rows = (s.table?.rows ?? [])
    .map((r) => ({
      _k: nextBlockKey(),
      label: r.label ?? "",
      items: (r.items ?? []).map((i) => i.text).join("\n"),
    }))
    .filter((r) => r.label.trim() || r.items.trim());
  if (rows.length || (s.table?.title ?? "").trim())
    out.push({ _k: nextBlockKey(), type: "table", title: s.table?.title ?? "", rows });
  if ((s.cta ?? "").trim())
    out.push({ _k: nextBlockKey(), type: "button", label: s.cta, href: s.ctaHref ?? "" });
  return out;
}

// Editor blocks → Payload blocks. Drops incomplete blocks/rows so no required
// field is ever sent empty (which would fail Payload validation).
export function blocksToPayload(blocks) {
  return (blocks ?? [])
    .map((b) => {
      if (b.type === "text")
        return (b.body ?? "").trim() ? { blockType: "text", text: b.body } : null;
      if (b.type === "list") {
        const items = splitL(b.items).map((text) => ({ text }));
        return items.length ? { blockType: "list", ordered: !!b.ordered, items } : null;
      }
      if (b.type === "table") {
        const rows = (b.rows ?? [])
          .map((r) => ({
            label: r.label ?? "",
            items: splitL(r.items).map((text) => ({ text })),
          }))
          .filter((r) => r.label.trim() || r.items.length);
        return rows.length ? { blockType: "table", title: b.title ?? "", rows } : null;
      }
      if (b.type === "button")
        return (b.label ?? "").trim()
          ? { blockType: "button", label: b.label, href: b.href ?? "" }
          : null;
      return null;
    })
    .filter(Boolean);
}

function IconBtn({ label, onClick, disabled, danger, children }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors disabled:pointer-events-none disabled:opacity-30",
              danger ? "hover:bg-destructive/10 hover:text-destructive" : "hover:bg-secondary hover:text-foreground"
            )}
          >
            {children}
          </button>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

// Textarea with a friendly "Add link" helper: highlight text, click Add link,
// the selection pre-fills "Text to show", and inserting replaces it with a link.
// No markdown syntax is ever shown to the editor; the address is validated.
function LinkableField({ value, onChange, rows = 3, placeholder, hint }) {
  const wrapRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState({ start: 0, end: 0 });
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");

  const ta = () => wrapRef.current?.querySelector("textarea");
  const openForm = () => {
    const el = ta();
    const v = value || "";
    const start = el ? el.selectionStart ?? v.length : v.length;
    const end = el ? el.selectionEnd ?? start : start;
    setSel({ start, end });
    setText(v.slice(start, end));
    setUrl("");
    setErr("");
    setOpen(true);
  };
  const insert = () => {
    const u = normUrl(url);
    if (!u) {
      setErr("Enter a valid web address, e.g. https://eportugal.gov.pt");
      return;
    }
    const snippet = text.trim() ? `[${text.trim()}](${u})` : u;
    const v = value || "";
    const s = Math.min(sel.start, v.length);
    const e = Math.min(sel.end, v.length);
    onChange(v.slice(0, s) + snippet + v.slice(e));
    setOpen(false);
    setText("");
    setUrl("");
    setErr("");
  };

  return (
    <div ref={wrapRef}>
      <Textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
      />
      {hint ? (
        <p className="mt-1 text-ds-xxs font-medium text-muted-foreground">{hint}</p>
      ) : null}
      <div className="mt-2">
        <button
          type="button"
          onClick={openForm}
          className="inline-flex items-center gap-1.5 text-ds-xxs font-bold text-muted-foreground transition-colors hover:text-primary"
        >
          <Link2 className="size-3.5" strokeWidth={2} />
          Add link
        </button>
      </div>
      {open ? (
        <div className="mt-2 rounded-lg border-2 border-border bg-muted/40 p-3">
          <label className="mb-1 block text-ds-xxs font-bold text-foreground">
            Text to show
          </label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g. the appointment form"
          />
          <label className="mb-1 mt-2 block text-ds-xxs font-bold text-foreground">
            Web address
          </label>
          <Input
            type="url"
            inputMode="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setErr("");
            }}
            placeholder="https://eportugal.gov.pt"
          />
          {err ? (
            <p className="mt-1 text-ds-xxs font-bold text-destructive">{err}</p>
          ) : null}
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={insert}>
              Insert link
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const inputLabel = "mb-1.5 block text-ds-xs font-medium text-foreground";

function BlockFields({ block, onPatch }) {
  if (block.type === "text") {
    return (
      <LinkableField
        value={block.body}
        onChange={(v) => onPatch({ body: v })}
        rows={3}
        placeholder="Write a paragraph…"
        hint="Separate paragraphs with a blank line."
      />
    );
  }
  if (block.type === "list") {
    return (
      <div>
        <div className="mb-2 inline-flex rounded-lg border-2 border-border p-0.5">
          {[
            { v: false, label: "Bulleted" },
            { v: true, label: "Numbered" },
          ].map((opt) => (
            <button
              key={String(opt.v)}
              type="button"
              aria-pressed={!!block.ordered === opt.v}
              onClick={() => onPatch({ ordered: opt.v })}
              className={cn(
                "rounded-md px-3 py-1 text-ds-xxs font-bold transition-colors",
                !!block.ordered === opt.v
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <LinkableField
          value={block.items}
          onChange={(v) => onPatch({ items: v })}
          rows={4}
          placeholder="One item per line"
          hint="One item per line."
        />
      </div>
    );
  }
  if (block.type === "button") {
    return (
      <div className="grid gap-3">
        <label className="block">
          <span className={inputLabel}>
            Label<span className="ml-0.5 text-destructive">*</span>
          </span>
          <Input
            value={block.label ?? ""}
            onChange={(e) => onPatch({ label: e.target.value })}
            placeholder="Book an appointment"
          />
        </label>
        <label className="block">
          <span className={inputLabel}>Link</span>
          <Input
            value={block.href ?? ""}
            onChange={(e) => onPatch({ href: e.target.value })}
            placeholder="/path or https://…"
          />
          <span className="mt-1 block text-ds-xxs font-medium text-muted-foreground">
            Where the button points. Leave blank to link to the service page.
          </span>
        </label>
      </div>
    );
  }
  // table
  const rows = block.rows ?? [];
  const setRow = (k, patch) =>
    onPatch({ rows: rows.map((r, idx) => (idx === k ? { ...r, ...patch } : r)) });
  const addRow = () =>
    onPatch({ rows: [...rows, { _k: nextBlockKey(), label: "", items: "" }] });
  const removeRow = (k) => onPatch({ rows: rows.filter((_, idx) => idx !== k) });
  return (
    <div className="grid gap-3">
      <label className="block">
        <span className={inputLabel}>
          Table title <span className="font-normal text-muted-foreground">— optional</span>
        </span>
        <Input
          value={block.title ?? ""}
          onChange={(e) => onPatch({ title: e.target.value })}
          placeholder="Documents Required"
        />
      </label>
      {rows.map((r, k) => (
        <div key={r._k} className="rounded-lg border-2 border-border bg-muted/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-ds-xxs font-bold text-muted-foreground">Row {k + 1}</span>
            <IconBtn label="Remove row" danger onClick={() => removeRow(k)}>
              <Trash2 className="size-4" strokeWidth={2} />
            </IconBtn>
          </div>
          <label className="block">
            <span className={inputLabel}>Label</span>
            <Input
              value={r.label ?? ""}
              onChange={(e) => setRow(k, { label: e.target.value })}
              placeholder="Proof of identity"
            />
          </label>
          <div className="mt-2">
            <span className={inputLabel}>Items</span>
            <LinkableField
              value={r.items}
              onChange={(v) => setRow(k, { items: v })}
              rows={2}
              placeholder="One item per line"
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={addRow} className="w-fit">
        <IconPlus className="size-3.5" />
        Add row
      </Button>
    </div>
  );
}

function BlockCard({ block, index, count, flashing, onPatch, onMove, onRemove }) {
  const { label, Icon } = BLOCK_META[block.type];
  return (
    <div
      data-block-card
      className={cn(
        "overflow-hidden rounded-lg border-2 border-border bg-card",
        flashing && "reorder-flash"
      )}
    >
      <div className="flex items-center gap-2 border-b-2 border-border px-3 py-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-ds-xxs font-bold text-primary">
          <Icon className="size-3.5" />
          {label}
        </span>
        <span className="flex-1" />
        <IconBtn label="Move up" onClick={() => onMove(-1)} disabled={index === 0}>
          <IconArrowDown className="size-4 rotate-180" />
        </IconBtn>
        <IconBtn label="Move down" onClick={() => onMove(1)} disabled={index === count - 1}>
          <IconArrowDown className="size-4" />
        </IconBtn>
        <IconBtn label="Delete block" danger onClick={onRemove}>
          <Trash2 className="size-4" strokeWidth={2} />
        </IconBtn>
      </div>
      <div className="p-3">
        <BlockFields block={block} onPatch={onPatch} />
      </div>
    </div>
  );
}

// The composable content of a section: an ordered list of block cards plus an
// "Add block" menu. `blocks` is the editor-shape array; `onChange` receives the
// next array (the parent keeps it in draft state, so dirty-tracking just works).
export function SectionBlocks({ blocks, onChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef(null);

  // Creation feedback for blocks — mirrors the section / link / FAQ rows and the
  // block-redesign prototype: a new block flashes, scrolls into view and its
  // first field takes focus, so adding a block is never silent. The flash class
  // is React-driven and starts unset on both the server and the client, so it
  // can't hydrate-mismatch; after commit we find the new node via that class.
  const [flashKey, setFlashKey] = useState(null);
  useEffect(() => {
    if (!flashKey) return;
    const node = wrapRef.current?.querySelector(".reorder-flash");
    if (node) {
      requestAnimationFrame(() => {
        node.scrollIntoView({ behavior: "smooth", block: "nearest" });
        node.querySelector("textarea, input")?.focus({ preventScroll: true });
      });
    }
    const t = setTimeout(
      () => setFlashKey((k) => (k === flashKey ? null : k)),
      700
    );
    return () => clearTimeout(t);
  }, [flashKey]);

  const add = (type) => {
    const b = emptyBlock(type);
    onChange([...blocks, b]);
    setMenuOpen(false);
    setFlashKey(b._k);
  };
  const patch = (j, p) => onChange(blocks.map((b, k) => (k === j ? { ...b, ...p } : b)));
  const move = (j, dir) => {
    const t = j + dir;
    if (t < 0 || t >= blocks.length) return;
    const arr = [...blocks];
    [arr[j], arr[t]] = [arr[t], arr[j]];
    onChange(arr);
  };
  const remove = (j) => onChange(blocks.filter((_, k) => k !== j));

  return (
    <div ref={wrapRef} className="space-y-2">
      {blocks.map((b, j) => (
        <BlockCard
          key={b._k}
          block={b}
          index={j}
          count={blocks.length}
          flashing={flashKey === b._k}
          onPatch={(p) => patch(j, p)}
          onMove={(d) => move(j, d)}
          onRemove={() => remove(j)}
        />
      ))}
      <div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          className="w-full border-dashed"
        >
          {/* The plus rotates 45° into an ✕ while the menu is open — a quiet
              cue that the same button now closes it (ease-out, 200ms). */}
          <IconPlus
            className={cn(
              "size-3.5 transition-transform duration-200",
              menuOpen && "rotate-45"
            )}
          />
          Add block
        </Button>
        {menuOpen ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {BLOCK_TYPES.map((t, i) => {
              const { label, desc, Icon } = BLOCK_META[t];
              return (
                // Cascade the choices in (same entry-appear + staggered delay as
                // the dashboard cards); press gives the Button's 1px nudge.
                <button
                  key={t}
                  type="button"
                  onClick={() => add(t)}
                  style={{ animationDelay: `${i * 45}ms` }}
                  className="flex animate-entry-appear items-center gap-3 rounded-lg border-2 border-border bg-card p-2.5 text-left transition-all hover:border-primary active:translate-y-px"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-ds-xs font-bold text-foreground">{label}</span>
                    <span className="block text-ds-xxs font-medium text-muted-foreground">
                      {desc}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
