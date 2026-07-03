import type { ReactNode } from "react";
import { Check, X } from "lucide-react";

import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";
import { DocTabs } from "./doc-tabs";
import { ExampleCard } from "./example-card";
import { ExpandablePreview } from "./expandable-preview";
import type { ComponentDoc } from "./styleguide-docs";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function PreviewFrame({
  children,
  fullWidth = false,
  slug,
  height,
}: {
  children: ReactNode;
  fullWidth?: boolean;
  slug?: string;
  height?: number;
}) {
  // Full-width system components render through an iframe (a real viewport)
  // via their /preview/[slug] route; slug is required for that path.
  if (fullWidth && slug) {
    return <ExpandablePreview slug={slug} height={height} />;
  }

  return (
    <div className="grid min-h-44 place-items-center rounded-lg bg-card p-8 ring-2 ring-border">
      <div className="w-full max-w-3xl [&>*]:mx-auto">{children}</div>
    </div>
  );
}

function DocBlock({
  id,
  title,
  children,
  className,
}: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-28 space-y-5", className)}>
      <h2 className="font-heading text-ds-xxl font-bold text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function InstallationBlock({ doc }: { doc: ComponentDoc }) {
  return (
    <DocBlock id="installation" title="Installation">
      <p className="max-w-3xl text-ds-s font-medium text-foreground">
        {doc.installation}
      </p>
      {doc.importCode ? <CodeBlock code={doc.importCode} /> : null}
    </DocBlock>
  );
}

function UsageBlock({ doc }: { doc: ComponentDoc }) {
  return (
    <DocBlock id="usage" title="Usage">
      <p className="max-w-3xl text-ds-s font-medium text-foreground">
        {doc.usage}
      </p>
      {doc.usageCode ? <CodeBlock code={doc.usageCode} /> : null}
    </DocBlock>
  );
}

function CompositionBlock({ doc }: { doc: ComponentDoc }) {
  return (
    <DocBlock id="composition" title="Composition">
      {doc.compositionCode ? <CodeBlock code={doc.compositionCode} /> : null}
      <ul className="grid gap-3 text-ds-s font-medium text-foreground">
        {doc.composition.map((item) => (
          <li key={item} className="rounded-lg bg-muted px-4 py-3">
            {item}
          </li>
        ))}
      </ul>
    </DocBlock>
  );
}

function BestPracticesBlock({ doc }: { doc: ComponentDoc }) {
  if (!doc.bestPractices?.length) return null;
  return (
    <DocBlock id="best-practices" title="Best practices">
      <div className="overflow-hidden rounded-lg ring-2 ring-border">
        <ul>
          {doc.bestPractices.map((practice) => (
            <li
              key={practice.text}
              className="flex items-start gap-4 border-b-2 border-border px-5 py-4 last:border-b-0"
            >
              <span
                className={cn(
                  "inline-flex min-h-7 shrink-0 items-center gap-1 rounded-full px-3 text-ds-xxs font-bold",
                  practice.kind === "do"
                    ? "bg-secondary text-brand-800"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {practice.kind === "do" ? (
                  <Check className="size-3" />
                ) : (
                  <X className="size-3" />
                )}
                {practice.kind === "do" ? "Do" : "Don't"}
              </span>
              <p className="min-w-0 pt-0.5 text-ds-xs font-medium text-foreground">
                {practice.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </DocBlock>
  );
}

function ExamplesBlock({ doc }: { doc: ComponentDoc }) {
  if (!doc.examples.length) return null;
  return (
    <DocBlock id="examples" title="Examples">
      <div className="space-y-8">
        {doc.examples.map((example) => (
          <ExampleCard
            key={example.title}
            id={slugify(example.title)}
            title={example.title}
            description={example.description}
            preview={example.preview}
            align={example.align}
            code={example.code ? <CodeBlock code={example.code} /> : undefined}
          />
        ))}
      </div>
    </DocBlock>
  );
}

function ApiTable({ rows }: { rows: ComponentDoc["api"] }) {
  return (
    <div className="overflow-x-auto rounded-lg ring-2 ring-border">
      <table className="w-full min-w-[720px] text-left text-ds-xs">
        <thead className="border-b-2 border-border text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-bold">Prop / token</th>
            <th className="px-4 py-3 font-bold">Type</th>
            <th className="px-4 py-3 font-bold">Default</th>
            <th className="px-4 py-3 font-bold">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.name}
              className="border-b-2 border-border last:border-b-0"
            >
              <td className="px-4 py-3 font-bold text-foreground">
                {row.name}
              </td>
              <td className="px-4 py-3 font-mono text-ds-xxs text-foreground">
                {row.type}
              </td>
              <td className="px-4 py-3 font-mono text-ds-xxs text-foreground">
                {row.defaultValue}
              </td>
              <td className="px-4 py-3 font-medium text-foreground">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PropertiesPanel({ doc }: { doc: ComponentDoc }) {
  if (doc.apiSections?.length) {
    return (
      <div className="space-y-8">
        {doc.apiSections.map((section) => (
          <section
            key={section.title}
            id={slugify(section.title)}
            className="scroll-mt-28 space-y-3"
          >
            <h3 className="font-heading text-ds-l font-bold text-foreground">
              <code className="font-mono text-ds-m">{section.title}</code>
            </h3>
            {section.description ? (
              <p className="max-w-3xl text-ds-s font-medium text-muted-foreground">
                {section.description}
              </p>
            ) : null}
            <ApiTable rows={section.rows} />
          </section>
        ))}
      </div>
    );
  }
  return <ApiTable rows={doc.api} />;
}

export function ComponentDocPage({ doc }: { doc: ComponentDoc }) {
  const isFoundation = doc.category === "Foundations";
  const hasComposition = doc.composition.length > 0;
  const guide = doc.guide ?? [];
  const hasGuide = guide.length > 0;
  const previewSections = doc.previewSections ?? [];
  const hasApi = (doc.apiSections?.length ?? 0) > 0 || doc.api.length > 0;

  const header = (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Tag>{doc.category}</Tag>
        {doc.status ? <Tag>{doc.status}</Tag> : null}
      </div>
      {/* Title + source form one tight group; the description gets more air
          (spacing communicates relationships). */}
      <div className="space-y-1.5">
        <h1 className="font-heading text-ds-xxxxl font-bold text-foreground">
          {doc.title}
        </h1>
        {doc.source ? (
          <p className="font-mono text-ds-xxs text-muted-foreground">
            {doc.source}
          </p>
        ) : null}
      </div>
      <p className="max-w-3xl pt-2 text-ds-l font-medium text-muted-foreground">
        {doc.description}
      </p>
      {doc.links?.length ? (
        <div className="flex flex-wrap items-center gap-2">
          {doc.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-8 items-center gap-1 rounded-full bg-muted px-3 text-ds-xxs font-bold text-foreground transition-colors hover:bg-secondary"
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      ) : null}
    </header>
  );

  // Foundations keep the guide layout with the right-hand anchor rail — their
  // content is prose, not props.
  if (isFoundation) {
    const rightNav: { id: string; label: string }[] = [
      ...previewSections.map((s) => ({ id: s.id, label: s.label })),
      ...(hasGuide
        ? guide.map((s) => ({ id: s.id, label: s.title }))
        : [
            { id: "installation", label: "Installation" },
            { id: "usage", label: "Usage" },
            ...(hasComposition
              ? [{ id: "composition", label: "Composition" }]
              : []),
          ]),
    ];

    return (
      <div className="grid min-w-0 gap-12 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <article className="min-w-0 space-y-14">
          {header}
          <PreviewFrame fullWidth={doc.fullWidthPreview} slug={doc.slug} height={doc.previewHeight}>
            {doc.preview}
          </PreviewFrame>
          {hasGuide ? (
            guide.map((section) => (
              <DocBlock key={section.id} id={section.id} title={section.title}>
                {section.body}
              </DocBlock>
            ))
          ) : (
            <>
              <InstallationBlock doc={doc} />
              <UsageBlock doc={doc} />
              {hasComposition ? <CompositionBlock doc={doc} /> : null}
            </>
          )}
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <p className="text-ds-xs font-bold text-muted-foreground">
              On This Page
            </p>
            <nav className="space-y-2">
              {rightNav.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block rounded-lg py-1 text-ds-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    );
  }

  // Primitives and system components: Astryx-style Overview | Properties tabs.
  const overview = (
    <div className="space-y-14">
      <InstallationBlock doc={doc} />
      <UsageBlock doc={doc} />
      <BestPracticesBlock doc={doc} />
      {hasComposition ? <CompositionBlock doc={doc} /> : null}
      <ExamplesBlock doc={doc} />
    </div>
  );

  return (
    <article className="mx-auto min-w-0 max-w-5xl space-y-10">
      {header}
      <PreviewFrame fullWidth={doc.fullWidthPreview} slug={doc.slug} height={doc.previewHeight}>
        {doc.preview}
      </PreviewFrame>
      {hasApi ? (
        <DocTabs
          tabs={[
            {
              id: "overview",
              label: "Overview",
              content: overview,
              sections: [
                { id: "installation", label: "Installation" },
                { id: "usage", label: "Usage" },
                ...(doc.bestPractices?.length
                  ? [{ id: "best-practices", label: "Best practices" }]
                  : []),
                ...(hasComposition
                  ? [{ id: "composition", label: "Composition" }]
                  : []),
                ...(doc.examples.length
                  ? [
                      { id: "examples", label: "Examples" },
                      ...doc.examples.map((example) => ({
                        id: slugify(example.title),
                        label: example.title,
                        child: true,
                      })),
                    ]
                  : []),
              ],
            },
            {
              id: "properties",
              label: "Properties",
              content: <PropertiesPanel doc={doc} />,
              sections:
                doc.apiSections?.map((section) => ({
                  id: slugify(section.title),
                  label: section.title,
                })) ?? [],
            },
          ]}
        />
      ) : (
        overview
      )}
    </article>
  );
}
