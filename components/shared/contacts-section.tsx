"use client";

import { useEffect, useMemo, useState } from "react";

import { usePostHog } from "posthog-js/react";
import { buttonVariants } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconArrowRight,
  IconInfo,
  IconMail,
  IconPhone,
  IconSearch,
} from "@/components/icons/ds-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Contact = {
  id: string;
  organization: string;
  service: string;
  phone: string;
  email: string;
  // Service slugs this contact belongs to — the single taxonomy. A contact can
  // sit in several categories and surfaces on each of their pages.
  categories: string[];
};

export type CategoryOption = { value: string; label: string };

function mapsHref(org: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${org}, Lisbon`
  )}`;
}

export function ContactsSection({
  title,
  subtitle,
  contacts,
  categories,
  defaultCategory = "all",
}: {
  title: string;
  subtitle?: string;
  contacts: Contact[];
  // Every service category, in display order — the filter options. Same list on
  // every page; only `defaultCategory` (the pre-selected value) differs.
  categories: CategoryOption[];
  defaultCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(defaultCategory);

  // Reset the filter to the page's category when navigating between category
  // pages (the same ContactsSection instance is reused across /services/[slug]
  // routes, so the useState initializer alone wouldn't pick up the new default).
  const [prevDefault, setPrevDefault] = useState(defaultCategory);
  if (defaultCategory !== prevDefault) {
    setPrevDefault(defaultCategory);
    setCategory(defaultCategory);
  }

  // slug -> title, for the Category column tags.
  const labelBySlug = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.value, c.label])),
    [categories]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (category !== "all" && !c.categories.includes(category)) return false;
      if (!q) return true;
      return (
        c.organization.toLowerCase().includes(q) ||
        c.service.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [contacts, query, category]);

  // Analytics: `contacts_searched` (object-action, past tense) — what people search
  // for in the contacts table. Debounced 800ms so we log completed searches, not
  // keystrokes. `results_count` surfaces zero-result searches — the gaps worth
  // learning from. No-op until PostHog is configured (usePostHog() is null without
  // the provider). See docs/ANALYTICS.md for the tracking plan.
  const posthog = usePostHog();
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const timer = setTimeout(() => {
      posthog?.capture("contacts_searched", {
        search_query: q.toLowerCase(),
        results_count: filtered.length,
        category_filter: category,
        list_name: title,
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [query, category, filtered.length, title, posthog]);

  // Base UI <SelectValue> resolves the label from this value→label map;
  // without it the trigger shows the raw value ("all").
  const categoryItems = useMemo(
    () => ({
      all: "All Contacts",
      ...Object.fromEntries(categories.map((c) => [c.value, c.label])),
    }),
    [categories]
  );

  return (
    <section className="bg-bg-page">
      <div className="mx-auto max-w-[1680px] px-4 pb-20 sm:px-6 lg:px-14">
        <header className="ds-section-x-padding flex items-center gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-dark text-primary-foreground">
            <IconInfo className="size-5" />
          </div>
          <h2 className="min-w-0 font-heading text-ds-xxxl font-bold text-brand-dark">
            {title}
          </h2>
        </header>
        {subtitle ? (
          <p className="ds-section-x-padding mt-3 font-heading text-ds-xs font-bold text-primary">
            {subtitle}
          </p>
        ) : null}

        <div className="ds-section-x-padding mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by organization, service, or email..."
              aria-label="Search contacts"
              className="pl-11"
            />
          </div>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v ?? "all")}
            items={categoryItems}
          >
            <SelectTrigger
              aria-label="Filter by category"
              className="w-full sm:w-60"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contacts</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ds-section-x-padding mt-4">
          {/* table-fixed + explicit column widths: column widths are derived from
              these headers, not the visible cell content — so filtering/searching
              (which changes the row set) never makes the columns jump. */}
          <Table className="min-w-[920px] table-fixed">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-[20%] py-3 text-ds-xxs font-medium text-muted-foreground">Organization</TableHead>
                <TableHead className="w-[22%] text-ds-xxs font-medium text-muted-foreground">Service Provided</TableHead>
                <TableHead className="w-[24%] text-ds-xxs font-medium text-muted-foreground">Contact Information</TableHead>
                <TableHead className="w-[20%] text-ds-xxs font-medium text-muted-foreground">Category</TableHead>
                <TableHead className="w-[14%] text-ds-xxs font-medium text-muted-foreground">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="border-border hover:bg-transparent">
                  <TableCell className="max-w-48 py-5 align-top text-ds-m font-bold whitespace-normal text-foreground">
                    {c.organization}
                  </TableCell>
                  <TableCell className="max-w-56 py-5 align-top text-ds-xxs font-medium whitespace-normal text-foreground">
                    {c.service}
                  </TableCell>
                  <TableCell className="py-5 align-top">
                    <div className="space-y-2">
                      <a
                        href={`mailto:${c.email}`}
                        className="flex items-center gap-2 text-ds-xxs font-bold text-primary hover:underline"
                      >
                        <IconMail className="size-4" />
                        {c.email}
                      </a>
                      {/* tel: href strips spaces/punctuation (keep digits + leading
                          +) so it dials correctly; the label stays formatted. */}
                      <a
                        href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}
                        className="flex items-center gap-2 text-ds-xxs font-bold text-primary hover:underline"
                      >
                        <IconPhone className="size-4" />
                        {c.phone}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {c.categories.map((slug) => (
                        <Tag key={slug}>{labelBySlug[slug] ?? slug}</Tag>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="py-5 align-top">
                    <a
                      href={mapsHref(c.organization)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants()}
                    >
                      Get Directions
                      <IconArrowRight className="size-4" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-ds-xs font-medium text-muted-foreground"
                  >
                    No contacts match your filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
