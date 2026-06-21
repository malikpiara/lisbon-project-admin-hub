import type { ReactNode } from "react";

import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./code-block";
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
}: {
  children: ReactNode;
  fullWidth?: boolean;
}) {
  if (fullWidth) {
    return (
      <div className="overflow-x-auto rounded-lg bg-bg-page ring-2 ring-border">
        <div className="w-[1680px]">{children}</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card p-8 ring-2 ring-border">
      {children}
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

export function ComponentDocPage({ doc }: { doc: ComponentDoc }) {
  const hasComposition = doc.composition.length > 0;
  const hasExamples = doc.examples.length > 0;
  const rightNav: { id: string; label: string; child?: boolean }[] = [
    { id: "installation", label: "Installation" },
    { id: "usage", label: "Usage" },
    ...(hasComposition ? [{ id: "composition", label: "Composition" }] : []),
    ...(hasExamples
      ? [
          { id: "examples", label: "Examples" },
          ...doc.examples.map((example) => ({
            id: slugify(example.title),
            label: example.title,
            child: true,
          })),
        ]
      : []),
    { id: "api-reference", label: "API Reference" },
  ];

  return (
    <div className="grid min-w-0 gap-12 lg:grid-cols-[minmax(0,1fr)_14rem]">
      <article className="min-w-0 space-y-14">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Tag>{doc.category}</Tag>
            {doc.status ? <Tag>{doc.status}</Tag> : null}
          </div>
          <h1 className="font-heading text-ds-xxxxl font-bold text-foreground">
            {doc.title}
          </h1>
          <p className="max-w-3xl text-ds-l font-medium text-muted-foreground">
            {doc.description}
          </p>
        </header>

        <PreviewFrame fullWidth={doc.fullWidthPreview}>
          {doc.preview}
        </PreviewFrame>

        <DocBlock id="installation" title="Installation">
          <p className="max-w-3xl text-ds-s font-medium text-foreground">
            {doc.installation}
          </p>
          {doc.importCode ? <CodeBlock code={doc.importCode} /> : null}
        </DocBlock>

        <DocBlock id="usage" title="Usage">
          <p className="max-w-3xl text-ds-s font-medium text-foreground">
            {doc.usage}
          </p>
          {doc.usageCode ? <CodeBlock code={doc.usageCode} /> : null}
        </DocBlock>

        {hasComposition ? (
          <DocBlock id="composition" title="Composition">
            <ul className="grid gap-3 text-ds-s font-medium text-foreground">
              {doc.composition.map((item) => (
                <li key={item} className="rounded-lg bg-muted px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </DocBlock>
        ) : null}

        {hasExamples ? (
          <DocBlock id="examples" title="Examples">
            <div className="space-y-10">
              {doc.examples.map((example) => (
                <section
                  key={example.title}
                  id={slugify(example.title)}
                  className="scroll-mt-28 space-y-4"
                >
                  <div>
                    <h3 className="font-heading text-ds-xl font-bold text-foreground">
                      {example.title}
                    </h3>
                    {example.description ? (
                      <p className="mt-2 max-w-3xl text-ds-s font-medium text-muted-foreground">
                        {example.description}
                      </p>
                    ) : null}
                  </div>
                  <PreviewFrame fullWidth={example.fullWidth}>
                    {example.preview}
                  </PreviewFrame>
                  {example.code ? <CodeBlock code={example.code} /> : null}
                </section>
              ))}
            </div>
          </DocBlock>
        ) : null}

        <DocBlock id="api-reference" title="API Reference">
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
                {doc.api.map((row) => (
                  <tr key={row.name} className="border-b-2 border-border last:border-b-0">
                    <td className="px-4 py-3 font-bold text-foreground">{row.name}</td>
                    <td className="px-4 py-3 font-mono text-ds-xxs text-foreground">{row.type}</td>
                    <td className="px-4 py-3 font-mono text-ds-xxs text-foreground">{row.defaultValue}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DocBlock>
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
                className={cn(
                  "block rounded-lg py-1 text-ds-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                  item.child && "pl-4"
                )}
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
