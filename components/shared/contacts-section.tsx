"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Info, Mail, Phone, Search } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

  return (
    <section className="bg-bg-page">
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-14">
        <header className="flex items-center gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-dark text-primary-foreground">
            <Info className="size-5" />
          </div>
          <h2 className="font-heading text-ds-xxl font-medium tracking-tight text-primary">
            {title}
          </h2>
        </header>
        {subtitle ? (
          <p className="mt-3 font-heading text-ds-s font-medium text-primary/80">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by organization, service, or email..."
              aria-label="Search contacts"
              className="h-12 pl-11"
            />
          </div>
          <div className="relative sm:w-60">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="h-12 w-full appearance-none rounded-lg border border-input bg-card pl-4 pr-10 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="all">All Categories</option>
              {categoryFilters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3 text-muted-foreground">Organization</TableHead>
                <TableHead className="text-muted-foreground">Service Provided</TableHead>
                <TableHead className="text-muted-foreground">Contact Information</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.organization} className="hover:bg-transparent">
                  <TableCell className="max-w-48 py-5 align-top text-base font-medium whitespace-normal text-foreground">
                    {c.organization}
                  </TableCell>
                  <TableCell className="max-w-56 align-top whitespace-normal text-muted-foreground">
                    {c.service}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="space-y-2">
                      <a
                        href={`mailto:${c.email}`}
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Mail className="size-4" />
                        {c.email}
                      </a>
                      <div className="flex items-center gap-2 text-primary">
                        <Phone className="size-4" />
                        {c.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge variant="outline" className="px-3 py-1 font-normal">
                      {c.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top">
                    <a
                      href={mapsHref(c.organization)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants()}
                    >
                      Get Directions
                      <ChevronRight className="size-4" />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-sm text-muted-foreground"
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
