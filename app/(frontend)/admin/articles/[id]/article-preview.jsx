"use client";

import { IconArrowRight } from "@/components/icons/ds-icons";
import { splitLines, splitParagraphs } from "@/lib/article-defaults";
import { renderInline } from "@/components/services/inline-links";
import { cn } from "@/lib/utils";

// Live preview of the article, rendered from the editor draft. A scaled-down but
// faithful echo of components/services/article-view.tsx — the whole point of the
// admin (and the #1 lesson from the Payload teardown): the editor should SEE the
// page as they write it, not author into blind form fields. Updates on every
// keystroke because it reads the same draft state the form mutates.
export function ArticlePreview({ draft, topicTitle }) {
  return (
    <div className="overflow-hidden rounded-lg border-2 border-border bg-bg-page">
      <div className="border-b-2 border-border bg-card px-6 py-5">
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

      <div className="space-y-6 px-6 py-6">
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
                {renderInline(s.lead, `pv-lead-${i}`)}
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
                          ps.map((p, k) => (
                            <p key={k}>{renderInline(p, `pv-x-${bk}-${k}`)}</p>
                          ))
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
                    const listClass = b.ordered ? "list-decimal" : "list-disc";
                    return items.length ? (
                      <ListTag
                        key={b._k ?? j}
                        className={cn(
                          listClass,
                          "space-y-0.5 pl-5 text-ds-xxs font-medium leading-relaxed text-brand-deep"
                        )}
                      >
                        {items.map((it, k) => (
                          <li key={k}>{renderInline(it, `pv-l-${bk}-${k}`)}</li>
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
                    const rows = b.rows ?? [];
                    return (
                      <div
                        key={b._k ?? j}
                        className="overflow-hidden rounded-md border-2 border-border"
                      >
                        {b.title ? (
                          <p className="bg-secondary/50 px-3 py-1.5 text-center text-ds-xxs font-bold uppercase tracking-wide text-primary">
                            {b.title}
                          </p>
                        ) : null}
                        {rows.length ? (
                          rows.map((r, k) => {
                            const items = splitLines(r.items);
                            return (
                              <div
                                key={r._k ?? k}
                                className="flex gap-3 border-t-2 border-border px-3 py-2 first:border-t-0"
                              >
                                <p className="w-1/3 shrink-0 text-ds-xxs font-bold text-foreground">
                                  {r.label?.trim() ? (
                                    r.label
                                  ) : (
                                    <span className="font-medium text-muted-foreground/60 italic">
                                      Label
                                    </span>
                                  )}
                                </p>
                                {items.length ? (
                                  <ul className="list-disc space-y-0.5 pl-4 text-ds-xxs font-medium text-brand-deep">
                                    {items.map((it, m) => (
                                      <li key={m}>
                                        {renderInline(it, `pv-tb-${bk}-${k}-${m}`)}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-ds-xxs font-medium text-muted-foreground/60 italic">
                                    Items…
                                  </span>
                                )}
                              </div>
                            );
                          })
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
                    <p className="mt-0.5 text-ds-xxs font-medium text-muted-foreground">
                      {renderInline(f.answer, `pv-faq-${i}`)}
                    </p>
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
