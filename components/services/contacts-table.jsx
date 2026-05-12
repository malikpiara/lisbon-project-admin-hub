"use client";

import { useMemo, useState } from "react";
import { Download, Filter, Mail, Phone as PhoneIcon, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ContactsTable({
  title,
  subtitle,
  contacts,
  categoryFilters,
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
    <section id="contacts" className="scroll-mt-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-2 text-center text-base text-muted-foreground">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by organization, service, or email..."
              aria-label="Search contacts"
              className="h-11 pl-9"
            />
          </div>
          <div className="relative sm:w-64">
            <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="h-11 w-full appearance-none rounded-md border border-input bg-background pl-9 pr-8 text-sm text-foreground shadow-xs ring-1 ring-transparent focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All categories</option>
              {categoryFilters.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="button"
            className="h-11 gap-2 rounded-md px-4"
            onClick={() => {
              // Prototype only — CSV export would happen here
            }}
          >
            <Download className="size-4" />
            Export
          </Button>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> of{" "}
          <span className="font-semibold text-foreground">{contacts.length}</span> contacts
        </p>

        <div className="mt-3 overflow-x-auto rounded-lg border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="py-3">Organization</TableHead>
                <TableHead>Service Provided</TableHead>
                <TableHead>Contact Information</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.organization}>
                  <TableCell className="py-4 align-top font-semibold text-foreground">
                    {c.organization}
                  </TableCell>
                  <TableCell className="align-top text-foreground/80">
                    {c.service}
                  </TableCell>
                  <TableCell className="align-top text-foreground/80">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="size-4 text-primary" />
                        <span>{c.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="size-4 text-primary" />
                        <a href={`mailto:${c.email}`} className="hover:underline">
                          {c.email}
                        </a>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary"
                    >
                      {c.category}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No contacts match your filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Note:</span> Contact
          availability and hours may vary. Please call ahead to confirm. For
          emergency support, dial{" "}
          <span className="font-semibold text-primary">112</span>.
        </p>
      </div>
    </section>
  );
}
