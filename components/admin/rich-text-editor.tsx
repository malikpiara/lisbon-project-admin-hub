"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { EditorContent, Extension, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { Plugin } from "@tiptap/pm/state";
// DS lacks list/link editor glyphs — kept on lucide, flagged in docs/DS-ICON-GAPS.md.
import { Link2, List, ListOrdered, Unlink } from "lucide-react";

import { IconCheck } from "@/components/icons/ds-icons";
import { DirtyDot } from "@/components/admin/field";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fromEditorJSON, toEditorHTML } from "@/lib/rich-text-editor";
import { cn } from "@/lib/utils";

// Visual text editor for non-technical editors: bold looks bold, lists look
// like lists, links are added by pasting an address. It SAVES the same plain
// text format the site already renders (lib/rich-text.ts) — the editor is only
// an input surface, so existing content, the public renderer and the review
// diff stay as they are.

// ---- Links -----------------------------------------------------------------

type LinkGuess = { href: string; kind: "website" | "email" | "phone" };

// Editors paste a website, an email or a phone number; we work out the link.
export function guessLink(raw: string): LinkGuess | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^mailto:/i.test(v)) return { href: v, kind: "email" };
  if (/^tel:/i.test(v)) return { href: v, kind: "phone" };
  if (/^https?:\/\/\S+\.\S+/i.test(v)) return { href: v, kind: "website" };
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return { href: `mailto:${v}`, kind: "email" };
  if (/^\+?[\d\s().-]{9,}$/.test(v)) return { href: `tel:${v.replace(/[^\d+]/g, "")}`, kind: "phone" };
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(v)) return { href: `https://${v}`, kind: "website" };
  return null;
}

// How a link reads back to the editor: no scheme, no trailing slash.
const prettyHref = (href: string) =>
  href.replace(/^(mailto:|tel:|https?:\/\/)(www\.)?/i, "").replace(/\/$/, "");

const KIND_LABEL: Record<LinkGuess["kind"], string> = {
  website: "Opens the website",
  email: "Opens an email to this address",
  phone: "Calls this number on phones",
};

// ---- Toolbar pieces --------------------------------------------------------

// "⌘" on Apple devices, "Ctrl" elsewhere (and on the server render).
const noSubscribe = () => () => {};
function useModKey() {
  return useSyncExternalStore(
    noSubscribe,
    () => (/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent) ? "⌘" : "Ctrl"),
    () => "Ctrl"
  );
}

function ToolButton({
  label,
  shortcut,
  hint,
  active = false,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  /** A plain-language second line, e.g. the typing shortcut for lists. */
  hint?: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            aria-pressed={active}
            // Keep the text selection: the click must not move focus first.
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={cn(
              "grid size-9 place-items-center rounded-md transition-colors",
              "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/35",
              active
                ? "bg-secondary text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side="top">
        <span className="flex items-center gap-2 font-bold">
          {label}
          {shortcut ? (
            <kbd className="rounded bg-background/15 px-1.5 py-0.5 font-sans text-[11px] font-bold">
              {shortcut}
            </kbd>
          ) : null}
        </span>
        {hint ? <span className="mt-0.5 block opacity-80">{hint}</span> : null}
      </TooltipContent>
    </Tooltip>
  );
}

const Divider = () => <span aria-hidden className="mx-1 h-5 w-0.5 rounded-full bg-border" />;

function LinkForm({
  initial,
  onApply,
  onCancel,
}: {
  initial: string;
  onApply: (href: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const guess = guessLink(value);
  const showError = value.trim().length > 3 && !guess;
  return (
    <div className="border-b-2 border-border bg-muted/60 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="rte-link-input">
          Link address
        </label>
        <input
          id="rte-link-input"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (guess) onApply(guess.href);
            }
            if (e.key === "Escape") {
              e.preventDefault();
              onCancel();
            }
          }}
          placeholder="Paste a website, email or phone number"
          aria-invalid={showError || undefined}
          className="h-9 min-w-0 flex-1 rounded-md border-2 border-input bg-card px-3 text-ds-xs font-medium text-foreground outline-none placeholder:text-muted-foreground focus:border-ring aria-invalid:border-destructive"
        />
        <button
          type="button"
          disabled={!guess}
          onClick={() => guess && onApply(guess.href)}
          className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-ds-xs font-bold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          <IconCheck className="size-3.5" />
          {initial ? "Update" : "Add link"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-md px-3 text-ds-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Cancel
        </button>
      </div>
      <p
        className={cn(
          "mt-1.5 min-h-4 text-ds-xxs font-medium",
          showError ? "text-destructive" : "text-muted-foreground"
        )}
        aria-live="polite"
      >
        {guess
          ? `${KIND_LABEL[guess.kind]}: ${prettyHref(guess.href)}`
          : showError
            ? "That doesn’t look like a website, email or phone number."
            : "Tip: select some words first to turn them into the link."}
      </p>
    </div>
  );
}

// ---- Editor ----------------------------------------------------------------

// Paste looks like our text format (e.g. copied from ChatGPT or an old
// article): convert it, instead of pasting literal ** and - markers. Rich
// pastes (Google Docs, Word) are left to the schema, which keeps only what we
// support (bold, italic, lists, links) and drops fonts, colours and sizes.
const LOOKS_FORMATTED = /\*\*\S|^\s*[-•*]\s+\S|^\s*\d{1,3}[.)]\s+\S|\[[^\]]+\]\([^)\s]+\)/m;

const FormattedTextPaste = Extension.create({
  name: "formattedTextPaste",
  addProseMirrorPlugins() {
    const editor = this.editor;
    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            const data = event.clipboardData;
            if (!data || data.getData("text/html")) return false;
            const text = data.getData("text/plain");
            if (!text || !LOOKS_FORMATTED.test(text)) return false;
            editor.commands.insertContent(toEditorHTML(text));
            return true;
          },
        },
      }),
    ];
  },
});

// ⌘K / Ctrl+K: ask the React side to open the link form (an event on the
// editor's DOM node, so the extension needs no React state).
const LINK_EVENT = "rte:open-link";
const LinkShortcut = Extension.create({
  name: "linkShortcut",
  addKeyboardShortcuts() {
    return {
      "Mod-k": () => {
        this.editor.view.dom.dispatchEvent(new CustomEvent(LINK_EVENT));
        return true;
      },
    };
  },
});

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing…",
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const mod = useModKey();
  const [linkForm, setLinkForm] = useState<null | { initial: string }>(null);
  // What we last emitted — to tell our own updates from outside changes
  // (Discard, switching items) that must reload the editor.
  const emitted = useRef(value);

  const editor = useEditor({
    // Next renders on the server first; mount the editor on the client.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["mailto", "tel"],
        },
      }),
      Placeholder.configure({ placeholder }),
      FormattedTextPaste,
      LinkShortcut,
    ],
    content: toEditorHTML(value),
    editorProps: {
      attributes: {
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        class: cn(
          "min-h-36 px-4 py-3 text-ds-xs font-medium leading-relaxed text-foreground outline-none",
          "[&_p+p]:mt-3 [&_ul]:my-3 [&_ol]:my-3 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_li+li]:mt-1",
          "[&_ol]:marker:font-bold [&_ol]:marker:text-primary",
          "[&_a]:font-bold [&_a]:text-primary [&_a]:underline",
          "[&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-muted-foreground [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]"
        ),
      },
    },
    onUpdate: ({ editor: e }) => {
      const next = fromEditorJSON(e.getJSON());
      emitted.current = next;
      onChange(next);
    },
  });
  // Reads the editor at call time, so it never acts on stale React state.
  const openLink = () => {
    if (!editor) return;
    const href = editor.isActive("link") ? (editor.getAttributes("link").href as string) : "";
    setLinkForm({ initial: href ? prettyHref(href) : "" });
  };

  useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const onOpen = () => {
      const href = editor.isActive("link") ? (editor.getAttributes("link").href as string) : "";
      setLinkForm({ initial: href ? prettyHref(href) : "" });
    };
    dom.addEventListener(LINK_EVENT, onOpen);
    return () => dom.removeEventListener(LINK_EVENT, onOpen);
  }, [editor]);

  // Outside change (e.g. Discard) → reload without echoing an update.
  useEffect(() => {
    if (!editor || value === emitted.current) return;
    emitted.current = value;
    editor.commands.setContent(toEditorHTML(value), { emitUpdate: false });
  }, [editor, value]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            link: e.isActive("link"),
            href: (e.getAttributes("link").href as string | undefined) ?? "",
          }
        : null,
  });

  const applyLink = (href: string) => {
    if (!editor) return;
    setLinkForm(null);
    const chain = editor.chain().focus().extendMarkRange("link");
    if (editor.state.selection.empty && !editor.isActive("link")) {
      chain
        .insertContent({ type: "text", text: prettyHref(href), marks: [{ type: "link", attrs: { href } }] })
        .insertContent(" ")
        .run();
    } else {
      chain.setLink({ href }).run();
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border-2 border-input bg-card transition-colors hover:border-muted-foreground focus-within:border-ring focus-within:hover:border-ring",
        className
      )}
    >
      <TooltipProvider delay={300}>
        <div
          role="toolbar"
          aria-label="Text formatting"
          className="flex flex-wrap items-center gap-0.5 border-b-2 border-border px-1.5 py-1.5"
        >
          <ToolButton label="Bold" shortcut={`${mod} B`} active={state?.bold} onClick={() => editor?.chain().focus().toggleBold().run()}>
            <span className="font-heading text-ds-s font-bold">B</span>
          </ToolButton>
          <ToolButton label="Italic" shortcut={`${mod} I`} active={state?.italic} onClick={() => editor?.chain().focus().toggleItalic().run()}>
            <span className="font-serif text-ds-s italic">I</span>
          </ToolButton>
          <Divider />
          <ToolButton label="Bulleted list" hint="Or type - and a space at the start of a line" active={state?.bullet} onClick={() => editor?.chain().focus().toggleBulletList().run()}>
            <List className="size-4" strokeWidth={2.25} />
          </ToolButton>
          <ToolButton label="Numbered list" hint="Or type 1. and a space at the start of a line" active={state?.ordered} onClick={() => editor?.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="size-4" strokeWidth={2.25} />
          </ToolButton>
          <Divider />
          <ToolButton label={state?.link ? "Edit link" : "Add link"} shortcut={`${mod} K`} hint={state?.link ? undefined : "Select some words first to turn them into a link"} active={state?.link || !!linkForm} onClick={() => openLink()}>
            <Link2 className="size-4" strokeWidth={2.25} />
          </ToolButton>
        </div>
      </TooltipProvider>

      {linkForm ? (
        <LinkForm
          initial={linkForm.initial}
          onApply={applyLink}
          onCancel={() => {
            setLinkForm(null);
            editor?.commands.focus();
          }}
        />
      ) : state?.link ? (
        // Cursor is inside a link: say where it goes, offer Edit / Remove.
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b-2 border-border bg-secondary/50 px-3 py-2 text-ds-xxs font-medium">
          <span className="flex min-w-0 items-center gap-1.5 text-foreground">
            <Link2 className="size-3.5 shrink-0 text-primary" strokeWidth={2.25} />
            <span className="truncate">
              Links to <span className="font-bold">{prettyHref(state.href)}</span>
            </span>
          </span>
          <span className="ml-auto flex items-center gap-1">
            <button type="button" onClick={() => openLink()} className="rounded px-2 py-1 font-bold text-primary hover:bg-card">
              Edit
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().extendMarkRange("link").unsetLink().run()}
              className="inline-flex items-center gap-1 rounded px-2 py-1 font-bold text-muted-foreground hover:bg-card hover:text-destructive"
            >
              <Unlink className="size-3.5" strokeWidth={2.25} />
              Remove link
            </button>
          </span>
        </div>
      ) : null}

      {editor ? <EditorContent editor={editor} /> : <div className="min-h-36" />}

      <p className="border-t-2 border-border px-4 py-2 text-ds-xxs font-medium text-muted-foreground">
        <kbd className="font-sans font-bold text-foreground">Enter</kbd> new paragraph ·{" "}
        <kbd className="font-sans font-bold text-foreground">Shift + Enter</kbd> new line
      </p>
    </div>
  );
}

// ---- Labelled field (admin forms) -------------------------------------------

/**
 * The editor as an admin form field: same label, required star and "changed
 * since saved" dot/wash as components/admin/field.jsx's Field.
 */
export function RichTextField({
  label,
  value,
  onChange,
  dirty = false,
  required = false,
  hint,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dirty?: boolean;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-ds-xs font-medium text-foreground">
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        ) : null}
        {dirty ? <DirtyDot className="ml-1.5" /> : null}
      </span>
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        ariaLabel={label}
        className={dirty ? "border-brand-300" : undefined}
      />
      {hint ? (
        <span className="mt-1 block text-ds-xxs font-medium text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}
