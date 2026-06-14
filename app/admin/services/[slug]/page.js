"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Contact,
  ExternalLink,
  FileText,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field } from "@/components/admin/field";
import { TonePicker } from "@/components/admin/tone-picker";
import { IconPicker } from "@/components/admin/icon-picker";
import { DeleteButton } from "@/components/admin/delete-button";
import { getServiceIcon } from "@/lib/service-icons";
import { toneHex } from "@/lib/admin-tones";
import { useAdmin } from "@/lib/admin-store";

export default function ServiceDetailAdminPage({ params }) {
  const { slug } = use(params);
  const {
    data,
    hydrated,
    updateService,
    removeService,
    resetService,
    updateTopic,
    addTopic,
    removeTopic,
    updateContact,
    addContact,
    removeContact,
  } = useAdmin();

  const service = data.services.find((s) => s.slug === slug);

  if (!hydrated) return <EditorSkeleton />;
  if (!service) notFound();

  const introText = service.intro.join("\n\n");
  const Icon = getServiceIcon(service.iconKey);
  const tint = toneHex(service.tone);

  return (
    <div>
      {/* Sticky header keeps the category, live-preview and actions in reach
          while scrolling a long editor. */}
      <div className="sticky top-0 z-10 border-b-2 border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-8 py-4">
          <Link
            href="/admin/services"
            className="inline-flex items-center gap-1.5 text-ds-xxs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            All categories
          </Link>

          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="grid size-10 shrink-0 place-items-center rounded-lg"
                style={{ backgroundColor: `${tint}1f`, color: tint }}
              >
                <Icon className="size-5" strokeWidth={1.9} />
              </span>
              <div className="min-w-0">
                <h1 className="truncate font-heading text-ds-xl font-bold text-foreground">
                  {service.title || "Untitled category"}
                </h1>
                <p className="truncate font-mono text-ds-xxs text-muted-foreground">
                  /services/{service.slug}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/services/${service.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                View on site
                <ExternalLink className="size-3.5" />
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => resetService(service.slug)}
              >
                <RotateCcw />
                Reset
              </Button>
              <DeleteButton
                onConfirm={() => {
                  removeService(service.slug);
                  window.location.href = "/admin/services";
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-8 py-10">
        {/* Basics */}
        <Section
          title="Basics"
          description="How this category appears on the home grid and its own page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Title"
              value={service.title}
              onChange={(v) => updateService(service.slug, { title: v })}
            />
            <Field
              label="Breadcrumb label"
              value={service.breadcrumb}
              onChange={(v) => updateService(service.slug, { breadcrumb: v })}
            />
            <Field
              className="sm:col-span-2"
              label="Short description"
              value={service.shortDescription}
              onChange={(v) =>
                updateService(service.slug, { shortDescription: v })
              }
              textarea
              rows={2}
            />
            <Field
              className="sm:col-span-2"
              label="Intro paragraphs"
              value={introText}
              onChange={(v) =>
                updateService(service.slug, {
                  intro: v.split(/\n\s*\n/).filter(Boolean),
                })
              }
              textarea
              rows={4}
            />
            <TonePicker
              className="sm:col-span-2"
              label="Card colour"
              value={service.tone}
              onChange={(v) => updateService(service.slug, { tone: v })}
            />
            <IconPicker
              className="sm:col-span-2"
              label="Icon"
              value={service.iconKey}
              onChange={(v) => updateService(service.slug, { iconKey: v })}
            />
          </div>
        </Section>

        {/* Contacts page header */}
        <Section
          title="Contacts page header"
          description="Heading shown above the contacts table on this category's page."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Section title"
              value={service.contactsTitle}
              onChange={(v) =>
                updateService(service.slug, { contactsTitle: v })
              }
            />
            <Field
              label="Section subtitle"
              value={service.contactsSubtitle}
              onChange={(v) =>
                updateService(service.slug, { contactsSubtitle: v })
              }
            />
          </div>
        </Section>

        {/* Topics */}
        <Section
          title="Topics"
          count={service.topics.length}
          action={
            <Button size="sm" onClick={() => addTopic(service.slug)}>
              <Plus className="size-3.5" />
              Add topic
            </Button>
          }
        >
          {service.topics.length === 0 ? (
            <EmptyState
              icon={FileText}
              label="No topics yet"
              hint="Topics become the article cards on this category's page."
            />
          ) : (
            <div className="space-y-2">
              {service.topics.map((topic) => (
                <EditorRow
                  key={topic.slug}
                  dot={topic.tone}
                  title={topic.title || "Untitled topic"}
                  subtitle={topic.description}
                  defaultOpen={topic.title === "New topic"}
                  onDelete={() => removeTopic(service.slug, topic.slug)}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Title"
                      value={topic.title}
                      onChange={(v) =>
                        updateTopic(service.slug, topic.slug, { title: v })
                      }
                    />
                    <TonePicker
                      label="Tone"
                      value={topic.tone}
                      onChange={(v) =>
                        updateTopic(service.slug, topic.slug, { tone: v })
                      }
                    />
                    <Field
                      className="sm:col-span-2"
                      label="Description"
                      value={topic.description}
                      onChange={(v) =>
                        updateTopic(service.slug, topic.slug, {
                          description: v,
                        })
                      }
                      textarea
                      rows={2}
                    />
                  </div>
                </EditorRow>
              ))}
            </div>
          )}
        </Section>

        {/* Contacts */}
        <Section
          title="Contacts"
          count={service.contacts.length}
          action={
            <Button size="sm" onClick={() => addContact(service.slug)}>
              <Plus className="size-3.5" />
              Add contact
            </Button>
          }
        >
          {service.contacts.length === 0 ? (
            <EmptyState
              icon={Contact}
              label="No contacts yet"
              hint="Contacts appear in the table on this category's page."
            />
          ) : (
            <div className="space-y-2">
              {service.contacts.map((contact, i) => (
                <EditorRow
                  key={i}
                  title={contact.organization || "New organization"}
                  subtitle={[contact.category, contact.service]
                    .filter(Boolean)
                    .join(" · ")}
                  defaultOpen={contact.organization === "New organization"}
                  onDelete={() => removeContact(service.slug, i)}
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Organization"
                      value={contact.organization}
                      onChange={(v) =>
                        updateContact(service.slug, i, { organization: v })
                      }
                    />
                    <Field
                      label="Category"
                      value={contact.category}
                      onChange={(v) =>
                        updateContact(service.slug, i, { category: v })
                      }
                    />
                    <Field
                      className="sm:col-span-2"
                      label="Service description"
                      value={contact.service}
                      onChange={(v) =>
                        updateContact(service.slug, i, { service: v })
                      }
                    />
                    <Field
                      label="Phone"
                      value={contact.phone}
                      onChange={(v) =>
                        updateContact(service.slug, i, { phone: v })
                      }
                    />
                    <Field
                      label="Email"
                      type="email"
                      value={contact.email}
                      onChange={(v) =>
                        updateContact(service.slug, i, { email: v })
                      }
                    />
                  </div>
                </EditorRow>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, count, description, action, children }) {
  return (
    <section className="mt-12 first:mt-0">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-heading text-ds-l font-bold text-foreground">
          {title}
          {typeof count === "number" ? (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-ds-xxs font-bold text-primary">
              {count}
            </span>
          ) : null}
        </h2>
        {action}
      </div>
      {description ? (
        <p className="mt-1 text-ds-xxs font-medium text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

// Collapsible editor row — a scannable summary that expands to the full fields.
function EditorRow({ dot, title, subtitle, defaultOpen, onDelete, children }) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="overflow-hidden rounded-lg border-2 border-border bg-card"
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <CollapsibleTrigger className="group/row flex min-w-0 flex-1 items-center gap-3 text-left outline-none">
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[panel-open]/row:rotate-90" />
          {dot ? (
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: toneHex(dot) }}
            />
          ) : null}
          <span className="min-w-0">
            <span className="block truncate text-ds-xs font-bold text-foreground">
              {title}
            </span>
            {subtitle ? (
              <span className="block truncate text-ds-xxs font-medium text-muted-foreground">
                {subtitle}
              </span>
            ) : null}
          </span>
        </CollapsibleTrigger>
        <DeleteButton onConfirm={onDelete} />
      </div>
      <CollapsibleContent className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0">
        <div className="border-t-2 border-border p-4">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function EmptyState({ icon: Icon, label, hint }) {
  return (
    <div className="rounded-lg border-2 border-dashed border-border px-6 py-10 text-center">
      {Icon ? (
        <Icon
          className="mx-auto mb-2 size-6 text-muted-foreground"
          strokeWidth={1.8}
        />
      ) : null}
      <p className="text-ds-xs font-bold text-foreground">{label}</p>
      {hint ? (
        <p className="mt-1 text-ds-xxs font-medium text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-8 py-10">
      <div className="h-3 w-28 rounded bg-muted" />
      <div className="mt-4 h-7 w-64 rounded bg-muted" />
      <div className="mt-10 space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
