"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, SelectField } from "@/components/admin/field";
import { iconOptions, toneOptions } from "@/lib/admin-default-data";
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

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-5xl px-8 py-10 text-ds-xs font-medium text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!service) notFound();

  const introText = service.intro.join("\n\n");

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <Link
        href="/admin/services"
        className="inline-flex items-center gap-1.5 text-ds-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        All categories
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-ds-xxl font-bold text-foreground">
            {service.title || "Untitled category"}
          </h1>
          <p className="mt-1 font-mono text-ds-xxs text-muted-foreground">
            /services/{service.slug}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => resetService(service.slug)}
          >
            <RotateCcw />
            Reset
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              if (
                window.confirm(`Delete "${service.title}"? This can't be undone.`)
              ) {
                removeService(service.slug);
                window.location.href = "/admin/services";
              }
            }}
            size="sm"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 />
            Delete
          </Button>
        </div>
      </div>

      {/* Basics */}
      <Section title="Basics">
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
            label="Short description (home grid card)"
            value={service.shortDescription}
            onChange={(v) =>
              updateService(service.slug, { shortDescription: v })
            }
            textarea
            rows={2}
          />
          <Field
            className="sm:col-span-2"
            label="Intro paragraphs (one per line, blank line separates)"
            value={introText}
            onChange={(v) =>
              updateService(service.slug, {
                intro: v.split(/\n\s*\n/).filter(Boolean),
              })
            }
            textarea
            rows={4}
          />
          <SelectField
            label="Card colour tone"
            value={service.tone}
            onChange={(v) => updateService(service.slug, { tone: v })}
            options={toneOptions}
          />
          <SelectField
            label="Icon"
            value={service.iconKey}
            onChange={(v) => updateService(service.slug, { iconKey: v })}
            options={iconOptions}
          />
        </div>
      </Section>

      {/* Contacts header copy */}
      <Section title="Contacts page header">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Contacts section title"
            value={service.contactsTitle}
            onChange={(v) =>
              updateService(service.slug, { contactsTitle: v })
            }
          />
          <Field
            label="Contacts section subtitle"
            value={service.contactsSubtitle}
            onChange={(v) =>
              updateService(service.slug, { contactsSubtitle: v })
            }
          />
        </div>
      </Section>

      {/* Topics */}
      <Section
        title={`Topics (${service.topics.length})`}
        action={
          <Button
            onClick={() => addTopic(service.slug)}
            size="sm"
          >
            <Plus className="size-3.5" />
            Add topic
          </Button>
        }
      >
        {service.topics.length === 0 ? (
          <EmptyState label="No topics yet." />
        ) : (
          <div className="space-y-3">
            {service.topics.map((topic) => (
              <Card
                key={topic.slug}
                className="gap-3 p-4"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Title"
                    value={topic.title}
                    onChange={(v) =>
                      updateTopic(service.slug, topic.slug, { title: v })
                    }
                  />
                  <SelectField
                    label="Tone"
                    value={topic.tone}
                    onChange={(v) =>
                      updateTopic(service.slug, topic.slug, { tone: v })
                    }
                    options={toneOptions}
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
                <div className="flex justify-end border-t-2 border-border pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => removeTopic(service.slug, topic.slug)}
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* Contacts */}
      <Section
        title={`Contacts (${service.contacts.length})`}
        action={
          <Button
            onClick={() => addContact(service.slug)}
            size="sm"
          >
            <Plus className="size-3.5" />
            Add contact
          </Button>
        }
      >
        {service.contacts.length === 0 ? (
          <EmptyState label="No contacts yet." />
        ) : (
          <div className="space-y-3">
            {service.contacts.map((contact, i) => (
              <Card key={i} className="gap-3 border-border/60 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
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
                <div className="flex justify-end border-t-2 border-border pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => removeContact(service.slug, i)}
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, action, children }) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-heading text-ds-l font-bold text-foreground">{title}</h2>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
}

function EmptyState({ label }) {
  return (
    <p className="rounded-lg border-2 border-dashed border-border p-8 text-center text-ds-xs font-medium text-muted-foreground">
      {label}
    </p>
  );
}
