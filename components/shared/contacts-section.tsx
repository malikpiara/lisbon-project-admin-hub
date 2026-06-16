"use client";

import { useMemo, useState } from "react";

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
  organization: string;
  service: string;
  phone: string;
  email: string;
  category: string;
};

function mapsHref(org: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${org}, Lisbon`
  )}`;
}

export function ContactsSection({
  title,
  subtitle,
  contacts,
  categoryFilters,
}: {
  title: string;
  subtitle?: string;
  contacts: Contact[];
  categoryFilters: string[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      if (!q) return true;
      return (
        c.organization.toLowerCase().includes(q) ||
        c.service.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [contacts, query, category]);

  // Base UI <SelectValue> resolves the label from this value→label map;
  // without it the trigger shows the raw value ("all").
  const categoryItems = useMemo(
    () => ({
      all: "All Categories",
      ...Object.fromEntries(categoryFilters.map((c) => [c, c])),
    }),
    [categoryFilters]
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
              <SelectItem value="all">All Categories</SelectItem>
              {categoryFilters.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ds-section-x-padding mt-4">
          <Table className="min-w-[920px]">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="py-3 text-ds-xxs font-medium text-muted-foreground">Organization</TableHead>
                <TableHead className="text-ds-xxs font-medium text-muted-foreground">Service Provided</TableHead>
                <TableHead className="text-ds-xxs font-medium text-muted-foreground">Contact Information</TableHead>
                <TableHead className="text-ds-xxs font-medium text-muted-foreground">Category</TableHead>
                <TableHead className="text-ds-xxs font-medium text-muted-foreground">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.organization} className="border-border hover:bg-transparent">
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
                      <div className="flex items-center gap-2 text-ds-xxs font-bold text-primary">
                        <IconPhone className="size-4" />
                        {c.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 align-top">
                    <Tag>{c.category}</Tag>
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
