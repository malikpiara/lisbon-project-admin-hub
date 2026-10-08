"use client";

import { IconArrowRight } from "@/components/icons/ds-icons";
import { splitLines, splitParagraphs } from "@/lib/article-defaults";
import { listClass, renderInlineRich, renderRichText } from "@/components/services/rich-text";
import { stripListMarker } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

// Live preview of the article, rendered from the editor draft. A scaled-down but
// faithful echo of components/services/article-view.tsx — the whole point of the
// admin (and the #1 lesson from the Payload teardown): the editor should SEE the
// page as they write it, not author into blind form fields. Updates on every
// keystroke because it reads the same draft state the form mutates.
export function ArticlePreview({ draft, topicTitle }) {
  return (
    <div className="flex max-h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-lg border-2 border-border bg-bg-page">
      <div className="shrink-0 border-b-2 border-border bg-card px-6 py-5">
        <p className="text-ds-xxs font-bold uppercase tracking-wide text-muted-foreground">
          Live preview
        </p>
        <h2 className="mt-2 font-heading text-ds-xl font-bold text-primary">
          {topicTitle || "Untitled article"}
        </h2>
        {draft.heroLead ? (
          <p className="mt-2 text-ds-s font-bold text-foreground">
            {draft.heroLead}
          </p>
        ) : null}
      </div>

      <div className="scroll-fade-y min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
        {draft.keyLinks?.length ? (
          <div>
            <h3 className="font-heading text-ds-s font-bold text-brand-dark">
              Key links
            </h3>
            <ul className="mt-3 space-y-1.5">
              {draft.keyLinks.map((l, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1 text-ds-xxs font-bold text-primary"
                >
                  <span className="underline underline-offset-[3px]">
                    {l.label || "Untitled link"}
                  </span>
                  <IconArrowRight className="size-3.5 shrink-0" />
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {draft.sections.map((s, i) => (
          <article key={s._k ?? i}>
            <h3 className="font-heading text-ds-s font-bold text-brand-dark">
              {s.heading || "Untitled section"}
            </h3>
            {s.lead ? (
              <p className="mt-1.5 text-ds-xs font-bold text-primary">
                {renderInlineRich(s.lead, `pv-lead-${i}`)}
              </p>
            ) : null}
            {/* Render every block, even before it's filled, so a block appears
                the moment it's added — immediate feedback. Empty content shows a
                muted placeholder. */}
            {s.blocks?.length ? (
              <div className="mt-2 space-y-3">
                {s.blocks.map((b, j) => {
                  const bk = `${i}-${j}`;
                  if (b.type === "text") {
                    const ps = splitParagraphs(b.body);
                    return (
                      <div
                        key={b._k ?? j}
                        className="space-y-2 text-ds-xxs font-medium leading-relaxed text-brand-deep"
                      >
                        {ps.length ? (
                          renderRichText(b.body, `pv-x-${bk}`)
                        ) : (
                          <p className="text-muted-foreground/60 italic">
                            Empty paragraph…
                          </p>
                        )}
                      </div>
                    );
                  }
                  if (b.type === "list") {
                    const items = splitLines(b.items);
                    const ListTag = b.ordered ? "ol" : "ul";
                    // Same markers as the page (bold teal step numbers), one
                    // size down to match the preview's compact type.
                    return items.length ? (
                      <ListTag
                        key={b._k ?? j}
                        className={cn(
                          listClass(b.ordered),
                          "space-y-0.5 pl-5 text-ds-xxs font-medium leading-relaxed text-brand-deep marker:text-ds-xs"
                        )}
                      >
                        {items.map((it, k) => (
                          <li key={k}>{renderInlineRich(stripListMarker(it), `pv-l-${bk}-${k}`)}</li>
                        ))}
                      </ListTag>
                    ) : (
                      <p
                        key={b._k ?? j}
                        className="text-ds-xxs font-medium text-muted-foreground/60 italic"
                      >
                        Empty list…
                      </p>
                    );
                  }
                  if (b.type === "table") {
                    // Mirrors reference-table.tsx: its own card surface, title
                    // and heading row on the mint tint, DS bold-muted headings,
                    // bold first cell, bullets only for multi-line cells.
                    // Compact, so no breakout here.
                    const headers = b.headers ?? ["", ""];
                    const rows = b.rows ?? [];
                    const grid = { gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` };
                    const showHeaders = headers.some((h) => (h ?? "").trim());
                    return (
                      <div
                        key={b._k ?? j}
                        className="overflow-hidden rounded-lg border-2 border-border bg-card"
                      >
                        {b.title ? (
                          <p
                            className={cn(
                              "bg-secondary/50 px-3 py-1.5 text-center text-ds-xxs font-bold uppercase tracking-wide text-primary",
                              showHeaders && "border-b-2 border-border"
                            )}
                          >
                            {b.title}
                          </p>
                        ) : null}
                        {showHeaders ? (
                          <div
                            className="grid gap-3 border-b-2 border-border bg-secondary/50 px-3 py-1.5 text-ds-xxs font-bold text-muted-foreground"
                            style={grid}
                          >
                            {headers.map((h, i) => (
                              <span key={i}>{h}</span>
                            ))}
                          </div>
                        ) : null}
                        {rows.length ? (
                          rows.map((r, k) => (
                            <div
                              key={r._k ?? k}
                              className={cn(
                                "grid gap-3 px-3 py-2",
                                k > 0 && "border-t-2 border-border"
                              )}
                              style={grid}
                            >
                              {headers.map((_, i) => {
                                const lines = splitLines(r.cells?.[i]);
                                const kb = `pv-tb-${bk}-${k}-${i}`;
                                if (i === 0) {
                                  return (
                                    <p key={i} className="text-ds-xxs font-bold text-foreground">
                                      {lines.length ? (
                                        lines.join(" ")
                                      ) : (
                                        <span className="font-medium text-muted-foreground/60 italic">
                                          Label
                                        </span>
                                      )}
                                    </p>
                                  );
                                }
                                if (lines.length > 1) {
                                  return (
                                    <ul
                                      key={i}
                                      className="list-disc space-y-0.5 pl-4 text-ds-xxs font-medium text-brand-deep"
                                    >
                                      {lines.map((it, m) => (
                                        <li key={m}>{renderInlineRich(stripListMarker(it), `${kb}-${m}`)}</li>
                                      ))}
                                    </ul>
                                  );
                                }
                                return (
                                  <p key={i} className="text-ds-xxs font-medium text-brand-deep">
                                    {lines.length ? (
                                      renderInlineRich(stripListMarker(lines[0]), kb)
                                    ) : (
                                      <span className="text-muted-foreground/60 italic">…</span>
                                    )}
                                  </p>
                                );
                              })}
                            </div>
                          ))
                        ) : (
                          <p className="px-3 py-2 text-ds-xxs font-medium text-muted-foreground/60 italic">
                            Add a row…
                          </p>
                        )}
                      </div>
                    );
                  }
                  if (b.type === "button") {
                    return (
                      <span
                        key={b._k ?? j}
                        className="inline-flex rounded-lg bg-primary px-3 py-1.5 text-ds-xxs font-bold text-primary-foreground"
                      >
                        {b.label || "Button"}
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
            ) : null}
          </article>
        ))}

        {draft.faqs.length ? (
          <div className="border-t-2 border-border pt-5">
            <h3 className="font-heading text-ds-s font-bold text-brand-dark">
              Frequently Asked Questions
            </h3>
            {draft.faqLead ? (
              <p className="mt-1.5 text-ds-xs font-bold text-primary">
                {draft.faqLead}
              </p>
            ) : null}
            <div className="mt-3 space-y-3">
              {draft.faqs.map((f, i) => (
                <div key={i}>
                  <p className="text-ds-xxs font-bold text-foreground">
                    {f.question || "Untitled question"}
                  </p>
                  {f.answer ? (
                    <div className="mt-0.5 space-y-2 text-ds-xxs font-medium text-muted-foreground">
                      {renderRichText(f.answer, `pv-faq-${i}`)}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
