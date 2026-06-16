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
import { Field } from "@/components/admin/field";
import { IconPicker } from "@/components/admin/icon-picker";
import { DeleteButton } from "@/components/admin/delete-button";
import {
  EditorRow,
  EditorSkeleton,
  EmptyState,
  Section,
} from "@/components/admin/editor-ui";
import { getServiceIcon } from "@/lib/service-icons";
import { useAdmin } from "@/lib/admin-store";

export default function ServiceDetailAdminPage({ params }) {
  const { slug } = use(params);
  const {
    data,
    hydrated,
    updateService,
    removeService,
    resetService,
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
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
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
          description="Each topic is an article on this category's page. Open one to edit its content."
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
                <div
                  key={topic.slug}
                  className="flex items-center gap-1 overflow-hidden rounded-lg border-2 border-border bg-card transition-colors hover:border-foreground/20"
                >
                  <Link
                    href={`/admin/services/${service.slug}/${topic.slug}`}
                    className="group flex min-w-0 flex-1 items-center gap-3 px-4 py-3 outline-none focus-visible:bg-secondary/40"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-ds-xs font-bold text-foreground">
                        {topic.title || "Untitled topic"}
                      </span>
                      {topic.description ? (
                        <span className="block truncate text-ds-xxs font-medium text-muted-foreground">
                          {topic.description}
                        </span>
                      ) : null}
                    </span>
                    <ChevronRight className="ml-auto size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <div className="pr-2">
                    <DeleteButton
                      onConfirm={() => removeTopic(service.slug, topic.slug)}
                    />
                  </div>
                </div>
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
