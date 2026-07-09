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

        {draft.sections.map((s, i) => {
          const paragraphs = splitParagraphs(s.body);
          const bullets = splitLines(s.bullets);
          const ListTag = s.ordered ? "ol" : "ul";
          const listClass = s.ordered ? "list-decimal" : "list-disc";
          // Show every added row (even before it's filled) so the table appears
          // the moment "Add row" is clicked — immediate feedback that a table is
          // taking shape. Empty label/items render as muted placeholders.
          const tableRows = s.table?.rows ?? [];
          return (
            <article key={i}>
              <h3 className="font-heading text-ds-s font-bold text-brand-dark">
                {s.heading || "Untitled section"}
              </h3>
              {s.lead ? (
                <p className="mt-1.5 text-ds-xs font-bold text-primary">
                  {renderInline(s.lead, `pv-lead-${i}`)}
                </p>
              ) : null}
              {paragraphs.length || bullets.length ? (
                <div className="mt-2 space-y-2 text-ds-xxs font-medium leading-relaxed text-brand-deep">
                  {paragraphs.map((p, j) => (
                    <p key={j}>{renderInline(p, `pv-p-${i}-${j}`)}</p>
                  ))}
                  {bullets.length ? (
                    <ListTag className={cn(listClass, "space-y-0.5 pl-5")}>
                      {bullets.map((b, j) => (
                        <li key={j}>{renderInline(b, `pv-b-${i}-${j}`)}</li>
                      ))}
                    </ListTag>
                  ) : null}
                </div>
              ) : null}
              {tableRows.length ? (
                <div className="mt-3 overflow-hidden rounded-md border-2 border-border">
                  {s.table.title ? (
                    <p className="bg-secondary/50 px-3 py-1.5 text-center text-ds-xxs font-bold uppercase tracking-wide text-primary">
                      {s.table.title}
                    </p>
                  ) : null}
                  {tableRows.map((r, j) => {
                    const items = splitLines(r.items);
                    return (
                      <div
                        key={r._k ?? j}
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
                            {items.map((it, k) => (
                              <li key={k}>
                                {renderInline(it, `pv-t-${i}-${j}-${k}`)}
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
                  })}
                </div>
              ) : null}
              {s.cta ? (
                <span className="mt-3 inline-flex rounded-lg bg-primary px-3 py-1.5 text-ds-xxs font-bold text-primary-foreground">
                  {s.cta}
                </span>
              ) : null}
            </article>
          );
        })}

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
