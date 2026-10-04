"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// DS lacks these — flagged for Rafael. ExternalLink signals "opens the live site
// in a new tab"; LayoutTemplate marks the standard-sections template shortcut.
import { ExternalLink, LayoutTemplate } from "lucide-react";
import {
  IconArrowRight,
  IconInfo,
  IconNotes,
  IconPlus,
} from "@/components/icons/ds-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Field,
  SelectField,
  HeadingComboField,
} from "@/components/admin/field";
import {
  ARTICLE_SECTION_TEMPLATES,
  SECTION_HEADING_PRESETS,
} from "@/lib/article-section-templates";
import {
  FORMAT_HINT,
  LinkableField,
  SectionBlocks,
  blocksFromPayload,
  blocksToPayload,
} from "@/components/admin/block-editor";
import { articleCompleteness } from "@/lib/article-completeness";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditorRow, EmptyState, Section } from "@/components/admin/editor-ui";
import { UnsavedChangesGuard } from "@/components/admin/unsaved-changes-guard";
import { SaveBar } from "@/components/admin/save-bar";
import { countChanges } from "@/lib/count-changes";
import { useFlip } from "@/lib/use-flip";
import { cn } from "@/lib/utils";
import { AuditMeta } from "@/components/admin/audit-meta";
import { deleteTopic, saveTopic } from "../actions";
import { ArticlePreview } from "./article-preview";

// Stable client-only keys per section/FAQ row so reordering can animate (FLIP)
// and mark the moved row by identity. toPayload reconstructs explicit fields, so
// `_k` is naturally dropped before saving.
let _rowKeySeq = 0;
const nextRowKey = () => `r${_rowKeySeq++}`;

// Payload <-> editor mapping. The big reconciliation is `bullets`: Payload models
// it as an array of { text }, the editor (and the public renderer) treat it as a
// blank-line/newline textarea — one item per line.
function fromPayload(topic) {
  const a = topic.article ?? {};
  return {
    title: topic.title ?? "",
    description: topic.description ?? "",
    authorOrg: topic.authorOrg ?? "",
    heroLead: a.heroLead ?? "",
    sections: (a.sections ?? []).map((s) => ({
      _k: nextRowKey(),
      heading: s.heading ?? "",
      lead: s.lead ?? "",
      // Ordered content blocks. blocksFromPayload synthesises them from the
      // deprecated body/bullets/table/cta fields when a section predates blocks.
      blocks: blocksFromPayload(s),
    })),
    keyLinks: (a.keyLinks ?? []).map((l) => ({
      _k: nextRowKey(),
      label: l.label ?? "",
      href: l.href ?? "",
    })),
    // PROTOTYPE (team feedback): two more shortcut lists beside Key links.
    keyContacts: (a.keyContacts ?? []).map((l) => ({ label: l.label ?? "", href: l.href ?? "" })),
    keyLocations: (a.keyLocations ?? []).map((l) => ({ label: l.label ?? "", href: l.href ?? "" })),
    faqLead: a.faqLead ?? "",
    faqs: (a.faqs ?? []).map((f) => ({
      _k: nextRowKey(),
      question: f.question ?? "",
      answer: f.answer ?? "",
    })),
  };
}

function toPayload(d) {
  return {
    title: d.title,
    description: d.description,
    authorOrg: d.authorOrg,
    article: {
      heroLead: d.heroLead,
      // Only heading/lead/blocks are written; the deprecated body/bullets/table/
      // cta fields are intentionally omitted, so saving migrates the section to
      // blocks and clears the old columns.
      sections: d.sections.map((s) => ({
        heading: s.heading,
        lead: s.lead,
        blocks: blocksToPayload(s.blocks),
      })),
      keyLinks: d.keyLinks.map((l) => ({ label: l.label, href: l.href })),
      keyContacts: d.keyContacts.filter((l) => l.label.trim() && l.href.trim()),
      keyLocations: d.keyLocations.filter((l) => l.label.trim() && l.href.trim()),
      faqLead: d.faqLead,
      faqs: d.faqs.map((f) => ({ question: f.question, answer: f.answer })),
    },
    // Which service this article belongs to. Editing it reassigns the topic
    // (and changes its public URL); saveTopic handles the move + revalidation.
    service: d.serviceId,
  };
}

export function ArticleEditor({
  topic,
  service,
  services = [],
  audit,
  isAdmin = true,
  pendingReview = false,
  // Never published yet (a fresh stub, or a first draft awaiting review).
  unpublished = false,
}) {
  const [draft, setDraft] = useState(() => ({
    ...fromPayload(topic),
    serviceId: service?.id ?? "",
  }));
  // Share draft's initial object so section/FAQ `_k`s match the baseline (separate
  // fromPayload calls would assign different keys and read as dirty on load).
  const [saved, setSaved] = useState(() => draft);
  const [phase, setPhase] = useState("idle"); // idle | saving | error
  // PROTOTYPE (team feedback): what the last save actually did. Editors were
  // re-submitting the same article several times (5× in 10 s on 2026-09-29)
  // because nothing on screen confirmed the submission; admins now also need
  // to know when a save was kept as a draft for being incomplete.
  const [outcome, setOutcome] = useState(null); // { status, missing } | null
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const sectionFlip = useFlip();
  const keyLinkFlip = useFlip();
  const faqFlip = useFlip();
  const [flashSectionKey, setFlashSectionKey] = useState(null);
  const [flashKeyLinkKey, setFlashKeyLinkKey] = useState(null);
  const [flashFaqKey, setFlashFaqKey] = useState(null);

  // Creation feedback: several editors added a section / link / FAQ without
  // realising, because a new row appends at the bottom — often below the fold —
  // with no motion. On create we flash the row AND scroll it into view.
  //
  // We look the row up through a client-only node registry rather than a DOM
  // `data-*` attribute: row keys come from a module-level counter that advances
  // independently on the SSR pass and the client, so rendering the key as an
  // attribute would hydrate-mismatch. `rowRef` composes the FLIP ref with a
  // collector, cached per key so the ref identity stays stable across renders.
  const rowNodes = useRef(new Map()); // key -> element
  const rowRefCbs = useRef(new Map()); // key -> stable combined ref callback
  const rowRef = (flipRef, key) => {
    let cb = rowRefCbs.current.get(key);
    if (!cb || cb._flip !== flipRef) {
      cb = (el) => {
        flipRef(el);
        if (el) {
          rowNodes.current.set(key, el);
        } else {
          rowNodes.current.delete(key);
          rowRefCbs.current.delete(key); // keys are never reused (monotonic)
        }
      };
      cb._flip = flipRef;
      rowRefCbs.current.set(key, cb);
    }
    return cb;
  };

  const [scrollToKey, setScrollToKey] = useState(null);
  useEffect(() => {
    if (!scrollToKey) return;
    const el = rowNodes.current.get(scrollToKey);
    // rAF so the just-mounted, auto-expanding row has laid out before we scroll.
    if (el) {
      requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      );
    }
    setScrollToKey(null);
  }, [scrollToKey]);

  // Flash + scroll a freshly-created row so it can't be missed. `k` is the new
  // row's stable key; `setFlashKey` is that list's flash setter.
  const revealRow = (k, setFlashKey) => {
    setFlashKey(k);
    setTimeout(() => setFlashKey((c) => (c === k ? null : c)), 700);
    setScrollToKey(k);
  };

  // Reorder by identity (`_k`): a row is "moved" when its key sits at a different
  // index than in the saved baseline. Wash/count compare by key too, so moving an
  // unedited row doesn't light up its fields.
  const savedSectionKeys = saved.sections.map((s) => s._k);
  const savedSectionByK = Object.fromEntries(
    saved.sections.map((s) => [s._k, s])
  );
  const reorderedSectionCount = draft.sections.reduce((n, s, i) => {
    const si = savedSectionKeys.indexOf(s._k);
    return n + (si !== -1 && si !== i ? 1 : 0);
  }, 0);
  const savedKeyLinkKeys = saved.keyLinks.map((l) => l._k);
  const savedKeyLinkByK = Object.fromEntries(
    saved.keyLinks.map((l) => [l._k, l])
  );
  const reorderedKeyLinkCount = draft.keyLinks.reduce((n, l, i) => {
    const si = savedKeyLinkKeys.indexOf(l._k);
    return n + (si !== -1 && si !== i ? 1 : 0);
  }, 0);
  const savedFaqKeys = saved.faqs.map((f) => f._k);
  const savedFaqByK = Object.fromEntries(saved.faqs.map((f) => [f._k, f]));
  const reorderedFaqCount = draft.faqs.reduce((n, f, i) => {
    const si = savedFaqKeys.indexOf(f._k);
    return n + (si !== -1 && si !== i ? 1 : 0);
  }, 0);

  // Honest diff: dirty derived from draft-vs-snapshot, so reverting clears it.
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const changeCount =
    countChanges(draft, saved) +
    reorderedSectionCount +
    reorderedKeyLinkCount +
    reorderedFaqCount;
  const fieldDirty = (a, b) => (a ?? "") !== (b ?? "");

  const set = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
  };
  const setSection = (i, patch) => {
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
  };
  // A template's `blocks` use the editor shape (items as newline strings); stamp
  // client-only `_k`s on each block (and each table row) before adding.
  const blocksFromTemplate = (t) =>
    (t.blocks ?? []).map((b) =>
      b.type === "table"
        ? { ...b, _k: nextRowKey(), rows: (b.rows ?? []).map((r) => ({ ...r, _k: nextRowKey() })) }
        : { ...b, _k: nextRowKey() }
    );
  const addSection = () => {
    const k = nextRowKey();
    setDraft((d) => ({
      ...d,
      sections: [
        ...d.sections,
        { _k: k, heading: "New section", lead: "", blocks: [] },
      ],
    }));
    revealRow(k, setFlashSectionKey);
  };
  // Scaffold the five standard sections most articles follow. Idempotent:
  // only appends templates whose heading isn't already present. Step-by-Step
  // starts with an empty numbered list; "Documents Required" with a starter table.
  const insertStandardSections = () => {
    const existing = new Set(draft.sections.map((s) => s.heading.trim()));
    const additions = ARTICLE_SECTION_TEMPLATES.filter(
      (t) => !existing.has(t.heading)
    ).map((t) => ({
      _k: nextRowKey(),
      heading: t.heading,
      lead: "",
      blocks: blocksFromTemplate(t),
    }));
    if (additions.length === 0) return;
    setDraft((d) => ({ ...d, sections: [...d.sections, ...additions] }));
    // Land on the first inserted section so the batch is unmistakably visible.
    setScrollToKey(additions[0]._k);
  };
  const removeSection = (i) => {
    setDraft((d) => ({ ...d, sections: d.sections.filter((_, idx) => idx !== i) }));
  };
  const moveSection = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= draft.sections.length) return;
    const movedKey = draft.sections[i]._k;
    setDraft((d) => {
      const arr = [...d.sections];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...d, sections: arr };
    });
    setFlashSectionKey(movedKey);
    setTimeout(() => setFlashSectionKey((c) => (c === movedKey ? null : c)), 700);
  };
  const duplicateSection = (i) => {
    const k = nextRowKey();
    setDraft((d) => {
      const arr = [...d.sections];
      arr.splice(i + 1, 0, { ...arr[i], _k: k });
      return { ...d, sections: arr };
    });
    revealRow(k, setFlashSectionKey);
  };
  const setKeyLink = (i, patch) => {
    setDraft((d) => ({
      ...d,
      keyLinks: d.keyLinks.map((l, idx) =>
        idx === i ? { ...l, ...patch } : l
      ),
    }));
  };
  const addKeyLink = () => {
    const k = nextRowKey();
    setDraft((d) => ({
      ...d,
      keyLinks: [...d.keyLinks, { _k: k, label: "New link", href: "" }],
    }));
    revealRow(k, setFlashKeyLinkKey);
  };
  const removeKeyLink = (i) => {
    setDraft((d) => ({
      ...d,
      keyLinks: d.keyLinks.filter((_, idx) => idx !== i),
    }));
  };
  const moveKeyLink = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= draft.keyLinks.length) return;
    const movedKey = draft.keyLinks[i]._k;
    setDraft((d) => {
      const arr = [...d.keyLinks];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...d, keyLinks: arr };
    });
    setFlashKeyLinkKey(movedKey);
    setTimeout(
      () => setFlashKeyLinkKey((c) => (c === movedKey ? null : c)),
      700
    );
  };
  const duplicateKeyLink = (i) => {
    const k = nextRowKey();
    setDraft((d) => {
      const arr = [...d.keyLinks];
      arr.splice(i + 1, 0, { ...arr[i], _k: k });
      return { ...d, keyLinks: arr };
    });
    revealRow(k, setFlashKeyLinkKey);
  };
  const setFaq = (i, patch) => {
    setDraft((d) => ({
      ...d,
      faqs: d.faqs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)),
    }));
  };
  const addFaq = () => {
    const k = nextRowKey();
    setDraft((d) => ({
      ...d,
      faqs: [...d.faqs, { _k: k, question: "New question", answer: "" }],
    }));
    revealRow(k, setFlashFaqKey);
  };
  const removeFaq = (i) => {
    setDraft((d) => ({ ...d, faqs: d.faqs.filter((_, idx) => idx !== i) }));
  };
  const moveFaq = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= draft.faqs.length) return;
    const movedKey = draft.faqs[i]._k;
    setDraft((d) => {
      const arr = [...d.faqs];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...d, faqs: arr };
    });
    setFlashFaqKey(movedKey);
    setTimeout(() => setFlashFaqKey((c) => (c === movedKey ? null : c)), 700);
  };
  const duplicateFaq = (i) => {
    const k = nextRowKey();
    setDraft((d) => {
      const arr = [...d.faqs];
      arr.splice(i + 1, 0, { ...arr[i], _k: k });
      return { ...d, faqs: arr };
    });
    revealRow(k, setFlashFaqKey);
  };

  const save = () => {
    const snapshot = draft;
    startTransition(async () => {
      setPhase("saving");
      try {
        const result = await saveTopic(topic.id, toPayload(snapshot));
        setSaved(snapshot); // advance the baseline so dirty clears
        setOutcome(result ?? null);
        setPhase("idle");
        // Re-fetch the server props (pendingReview chip, audit meta) so the
        // page reflects the new state without a manual reload.
        router.refresh();
      } catch {
        setPhase("error");
      }
    });
  };

  const discard = () => {
    setDraft(saved);
    setPhase("idle");
  };

  // Live "ready to publish" checklist, from the same rule the server enforces.
  const completeness = articleCompleteness(toPayload(draft));

  const serviceSlug = service?.slug ?? "";
  const publicHref = serviceSlug
    ? `/services/${serviceSlug}/${topic.slug}`
    : null;

  const serviceOptions = services.map((s) => ({ value: s.id, label: s.title }));
  // The service currently chosen in the draft — may differ from the original
  // `service` prop once the editor reassigns it. `serviceChanged` drives the
  // move warning + the field's dirty dot (compared to the saved baseline).
  const selectedService =
    services.find((s) => s.id === draft.serviceId) ?? service;
  const serviceChanged = draft.serviceId !== saved.serviceId;

  return (
    <div>
      <UnsavedChangesGuard when={dirty} />
      <SaveBar
        dirty={dirty}
        count={changeCount}
        saving={phase === "saving"}
        error={phase === "error"}
        onSave={save}
        onDiscard={discard}
        saveLabel={isAdmin ? "Save" : "Submit for review"}
        savingLabel={isAdmin ? "Saving…" : "Submitting…"}
      />
      <div className="sticky top-0 z-10 border-b-2 border-border bg-card/95 backdrop-blur">
        <div className="mx-auto max-w-6xl px-8 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/articles">Articles</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {service ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/admin/services/${service.id}`}>
                      {service.title}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              ) : null}
              <BreadcrumbItem>
                <BreadcrumbPage>{draft.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <IconNotes className="size-5" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate font-heading text-ds-xl font-bold text-foreground">
                  {draft.title || "Untitled article"}
                  {pendingReview ? (
                    <span
                      className="ml-2 inline-block rounded-full border-2 border-border px-2 py-0.5 align-middle text-ds-xxs font-bold text-muted-foreground"
                      title={
                        isAdmin
                          ? "An editor submitted changes — approve or decline them under Review"
                          : "Your changes are waiting for an admin to approve them"
                      }
                    >
                      Pending review
                    </span>
                  ) : null}
                  {unpublished ? (
                    <span
                      className="ml-2 inline-block rounded-full border-2 border-border px-2 py-0.5 align-middle text-ds-xxs font-bold text-muted-foreground"
                      title="This article is not on the live site yet"
                    >
                      Draft · not live
                    </span>
                  ) : null}
                </h1>
                <p className="truncate font-mono text-ds-xxs text-muted-foreground">
                  /services/{serviceSlug}/{topic.slug}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {publicHref && !unpublished ? (
                <Link
                  href={publicHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  View on site
                  <ExternalLink className="size-3.5" strokeWidth={2} />
                </Link>
              ) : null}
              <DeleteButton
                onConfirm={() =>
                  startTransition(async () => {
                    await deleteTopic(topic.id, service?.id);
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {audit && (audit.modified || audit.created) ? (
        <div className="border-b-2 border-border bg-card">
          <div className="mx-auto max-w-6xl px-8 py-4">
            <AuditMeta audit={audit} />
          </div>
        </div>
      ) : null}

      {/* PROTOTYPE (team feedback): publish-readiness + save outcome. One
          strip, three states — incomplete (what's missing), submitted (what
          happens next), published. Hidden only when there is nothing to say. */}
      {outcome || !completeness.complete ? (
        <div className="border-b-2 border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-8 py-3 text-ds-xxs font-medium text-foreground">
            {outcome?.status === "draft" && !isAdmin ? (
              <p>
                <span className="font-bold text-primary">Submitted for review.</span>{" "}
                An admin will check it and publish it; the live page stays as it
                was until then.
              </p>
            ) : null}
            {outcome?.status === "draft" && isAdmin ? (
              <p>
                <span className="font-bold text-primary">Saved as a draft, not published.</span>{" "}
                {completeness.complete
                  ? "Save again to publish it."
                  : "It will go live on the next save once the items below are filled in."}
              </p>
            ) : null}
            {outcome?.status === "published" ? (
              <p>
                <span className="font-bold text-primary">Published.</span> The
                live page is being refreshed.
              </p>
            ) : null}
            {!completeness.complete ? (
              <div className={outcome ? "mt-2" : ""}>
                <p className="font-bold">Before this article can go live:</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5">
                  {completeness.missing.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mx-auto grid max-w-6xl gap-8 px-8 pt-12 pb-28 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
        <div className="min-w-0">
        <Section
          title="Basics"
          description="The title and summary shown on the service page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Title"
              required
              value={draft.title}
              onChange={(v) => set({ title: v })}
              dirty={fieldDirty(draft.title, saved.title)}
            />
            <SelectField
              label="Service"
              value={draft.serviceId}
              onChange={(v) => set({ serviceId: v })}
              options={serviceOptions}
              dirty={serviceChanged}
              hint="Which service this article lives under."
            />
            {serviceChanged && selectedService ? (
              <div className="rounded-lg border-2 border-brand-300 bg-muted px-4 py-3 text-ds-xxs font-medium text-foreground sm:col-span-2">
                Saving moves this article to{" "}
                <span className="font-bold">{selectedService.title}</span> and
                changes its public link from{" "}
                <span className="font-mono">
                  /services/{service?.slug}/{topic.slug}
                </span>{" "}
                to{" "}
                <span className="font-mono">
                  /services/{selectedService.slug}/{topic.slug}
                </span>
                . Existing links to the old address will stop working.
              </div>
            ) : null}
            <Field
              className="sm:col-span-2"
              label="Description"
              hint="Shown on the service page card, and reused as the intro line."
              value={draft.description}
              onChange={(v) => set({ description: v })}
              dirty={fieldDirty(draft.description, saved.description)}
              textarea
              rows={2}
            />
            <Field
              className="sm:col-span-2"
              label="Hero subheading"
              hint="The bold line under the title at the top of the article."
              value={draft.heroLead}
              onChange={(v) => set({ heroLead: v })}
              dirty={fieldDirty(draft.heroLead, saved.heroLead)}
            />
            <Field
              label="Written by"
              hint="Organisation credited in the byline (“By … · date”). The date is stamped on first publish."
              value={draft.authorOrg}
              onChange={(v) => set({ authorOrg: v })}
              dirty={fieldDirty(draft.authorOrg, saved.authorOrg)}
              placeholder="Lisbon Project"
            />
          </div>
        </Section>

        <Section
          title="Key links"
          description="Shortcut links shown at the top of the article, before the content sections."
          count={draft.keyLinks.length}
          action={
            <Button size="sm" onClick={addKeyLink}>
              <IconPlus className="size-3.5" />
              Add link
            </Button>
          }
        >
          {draft.keyLinks.length === 0 ? (
            <EmptyState
              icon={IconArrowRight}
              label="No key links yet"
              hint="Key links appear as a short list of shortcuts at the top of the article."
            />
          ) : (
            <div className="space-y-2">
              {draft.keyLinks.map((l, i) => {
                const lc = savedKeyLinkByK[l._k];
                const si = savedKeyLinkKeys.indexOf(l._k);
                const moved = si !== -1 && si !== i;
                return (
                  <div key={l._k} ref={rowRef(keyLinkFlip(l._k), l._k)}>
                    <EditorRow
                      title={l.label || "Untitled link"}
                      subtitle={l.href}
                      defaultOpen={l.label === "New link"}
                      onDelete={() => removeKeyLink(i)}
                      onMoveUp={() => moveKeyLink(i, -1)}
                      onMoveDown={() => moveKeyLink(i, 1)}
                      onDuplicate={() => duplicateKeyLink(i)}
                      isFirst={i === 0}
                      isLast={i === draft.keyLinks.length - 1}
                      marked={moved}
                      flashing={flashKeyLinkKey === l._k}
                    >
                      <div className="grid gap-4">
                        <Field
                          label="Label"
                          required
                          value={l.label}
                          onChange={(v) => setKeyLink(i, { label: v })}
                          dirty={fieldDirty(l.label, lc?.label)}
                        />
                        <Field
                          label="Link"
                          required
                          hint="Use /path for an internal page or https://… for an external site."
                          value={l.href}
                          onChange={(v) => setKeyLink(i, { href: v })}
                          dirty={fieldDirty(l.href, lc?.href)}
                          placeholder="/path or https://…"
                        />
                      </div>
                    </EditorRow>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* PROTOTYPE (team feedback): the Key links block is three cards —
            Websites (the list above), Contacts and Locations. Plain rows here;
            the reorder/flash polish of Key links can follow if the shape sticks. */}
        {[
          { key: "keyContacts", title: "Key contacts", hint: "People or desks to reach — tel:…, mailto:… or a page.", placeholder: "tel:+351… / mailto:… / https://…" },
          { key: "keyLocations", title: "Key locations", hint: "Places to go — a Google Maps link or an address page.", placeholder: "https://maps.google.com/…" },
        ].map(({ key, title, hint, placeholder }) => (
          <Section
            key={key}
            title={title}
            description={hint}
            count={draft[key].length}
            action={
              <Button
                size="sm"
                onClick={() =>
                  set({ [key]: [...draft[key], { label: "", href: "" }] })
                }
              >
                <IconPlus className="size-3.5" />
                Add
              </Button>
            }
          >
            {draft[key].length === 0 ? (
              <EmptyState
                icon={IconArrowRight}
                label={`No ${title.toLowerCase()}`}
                hint="Leave this empty and the card is simply not shown."
              />
            ) : (
              <div className="space-y-3">
                {draft[key].map((l, i) => (
                  <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                    <Field
                      label="Label"
                      value={l.label}
                      onChange={(v) =>
                        set({ [key]: draft[key].map((r, idx) => (idx === i ? { ...r, label: v } : r)) })
                      }
                    />
                    <Field
                      label="Link"
                      value={l.href}
                      onChange={(v) =>
                        set({ [key]: draft[key].map((r, idx) => (idx === i ? { ...r, href: v } : r)) })
                      }
                      placeholder={placeholder}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="self-end"
                      onClick={() => set({ [key]: draft[key].filter((_, idx) => idx !== i) })}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Section>
        ))}

        <Section
          title="Article sections"
          count={draft.sections.length}
          action={
            <Button size="sm" onClick={addSection}>
              <IconPlus className="size-3.5" />
              Add section
            </Button>
          }
        >
          {draft.sections.length === 0 ? (
            <EmptyState
              icon={IconNotes}
              label="No sections yet"
              hint="Most articles follow the same five sections. Start from the standard set, then edit each one."
              action={
                <Button variant="secondary" size="sm" onClick={insertStandardSections}>
                  <LayoutTemplate className="size-3.5" />
                  Insert standard sections
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {draft.sections.map((s, i) => {
                const sc = savedSectionByK[s._k];
                const si = savedSectionKeys.indexOf(s._k);
                const moved = si !== -1 && si !== i;
                return (
                  <div key={s._k} ref={rowRef(sectionFlip(s._k), s._k)}>
                    <EditorRow
                      title={s.heading || "Untitled section"}
                      subtitle={s.lead}
                      defaultOpen={s.heading === "New section"}
                      onDelete={() => removeSection(i)}
                      onMoveUp={() => moveSection(i, -1)}
                      onMoveDown={() => moveSection(i, 1)}
                      onDuplicate={() => duplicateSection(i)}
                      isFirst={i === 0}
                      isLast={i === draft.sections.length - 1}
                      marked={moved}
                      flashing={flashSectionKey === s._k}
                    >
                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <HeadingComboField
                            label="Heading"
                            required
                            value={s.heading}
                            onChange={(v) => setSection(i, { heading: v })}
                            onPickPreset={(heading) =>
                              setSection(i, { heading })
                            }
                            presets={SECTION_HEADING_PRESETS}
                            dirty={fieldDirty(s.heading, sc?.heading)}
                          />
                          <Field
                            label="Lead"
                            hint="Teal intro line above the content."
                            value={s.lead}
                            onChange={(v) => setSection(i, { lead: v })}
                            dirty={fieldDirty(s.lead, sc?.lead)}
                          />
                        </div>
                        <div>
                          <p className="mb-2 flex items-center gap-2 text-ds-xs font-bold text-foreground">
                            Content
                            {s.blocks.length ? (
                              <span className="rounded-full bg-secondary px-2 py-0.5 text-ds-xxs font-bold text-primary">
                                {s.blocks.length}
                              </span>
                            ) : null}
                          </p>
                          <SectionBlocks
                            blocks={s.blocks}
                            onChange={(bl) => setSection(i, { blocks: bl })}
                          />
                        </div>
                      </div>
                    </EditorRow>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <Section
          title="FAQ"
          count={draft.faqs.length}
          action={
            <Button size="sm" onClick={addFaq}>
              <IconPlus className="size-3.5" />
              Add question
            </Button>
          }
        >
          <Field
            className="mb-4"
            label="FAQ subheading"
            value={draft.faqLead}
            onChange={(v) => set({ faqLead: v })}
            dirty={fieldDirty(draft.faqLead, saved.faqLead)}
          />
          {draft.faqs.length === 0 ? (
            <EmptyState
              icon={IconInfo}
              label="No questions yet"
              hint="Questions appear as an expandable list at the foot of the article."
            />
          ) : (
            <div className="space-y-2">
              {draft.faqs.map((f, i) => {
                const fc = savedFaqByK[f._k];
                const si = savedFaqKeys.indexOf(f._k);
                const moved = si !== -1 && si !== i;
                return (
                  <div key={f._k} ref={rowRef(faqFlip(f._k), f._k)}>
                    <EditorRow
                      title={f.question || "Untitled question"}
                      subtitle={f.answer}
                      defaultOpen={f.question === "New question"}
                      onDelete={() => removeFaq(i)}
                      onMoveUp={() => moveFaq(i, -1)}
                      onMoveDown={() => moveFaq(i, 1)}
                      onDuplicate={() => duplicateFaq(i)}
                      isFirst={i === 0}
                      isLast={i === draft.faqs.length - 1}
                      marked={moved}
                      flashing={flashFaqKey === f._k}
                    >
                      <div className="grid gap-4">
                        <Field
                          label="Question"
                          required
                          value={f.question}
                          onChange={(v) => setFaq(i, { question: v })}
                          dirty={fieldDirty(f.question, fc?.question)}
                        />
                        <div>
                          <span className="mb-1.5 block text-ds-xs font-medium text-foreground">
                            Answer
                          </span>
                          <LinkableField
                            value={f.answer}
                            onChange={(v) => setFaq(i, { answer: v })}
                            rows={4}
                            hint={FORMAT_HINT}
                          />
                        </div>
                      </div>
                    </EditorRow>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <ArticlePreview draft={draft} topicTitle={draft.title} />
          </div>
        </aside>
      </div>
    </div>
  );
}
