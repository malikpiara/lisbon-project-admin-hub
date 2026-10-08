"use client";

import {
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  ViewTransition,
} from "react";

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
import { Icon } from "@/components/ui/icon";
import { socialLink, telHref, websiteLink } from "@/lib/contact-channels";
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
  // Channels (lib/contact-channels.js): each entry is one icon link.
  phones: { number: string; label: string }[];
  emails: string[];
  websites: { url: string; label: string }[];
  socials: { network: string; handle: string }[];
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

// The DS glyph for each social network; anything else is a globe.
const SOCIAL_ICON: Record<string, string> = {
  instagram: "instagram",
  facebook: "facebook",
  linkedin: "linkedin",
  whatsapp: "whatsapp",
};

// One channel = one icon link (Figma table-row: button-tertiary rows). Only
// rendered for channels that exist, so a missing one leaves no bare icon.
function ChannelLink({
  href,
  icon,
  external = false,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-2 text-ds-xxs font-bold text-primary hover:underline"
    >
      {icon}
      <span className="min-w-0 break-words">{children}</span>
    </a>
  );
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

  // Filtering reads the deferred query so a text-search change is a Transition —
  // which is what makes the table cross-fade via <ViewTransition> below. The
  // input stays bound to `query`, so typing is unaffected. (Category changes are
  // urgent, so switching category doesn't cross-fade — only search does.)
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return contacts.filter((c) => {
      if (category !== "all" && !c.categories.includes(category)) return false;
      if (!q) return true;
      return (
        c.organization.toLowerCase().includes(q) ||
        c.service.toLowerCase().includes(q) ||
        c.emails.some((e) => e.toLowerCase().includes(q)) ||
        c.phones.some((p) => p.number.replace(/\s/g, "").includes(q.replace(/\s/g, ""))) ||
        c.websites.some((w) => w.url.toLowerCase().includes(q))
      );
    });
  }, [contacts, deferredQuery, category]);

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
      all: "All Categories",
      ...Object.fromEntries(categories.map((c) => [c.value, c.label])),
    }),
    [categories]
  );

  return (
    <section id="contacts" className="scroll-mt-20 bg-bg-page">
      <div className="mx-auto max-w-[1680px] px-4 pb-20 sm:px-6 lg:px-14">
       {/* Figma section-grid 3393:7225: its .background is semantic/background/
           primary — the page mint, not the white card the services section
           uses. Same 92px padding and gaps, no card surface. */}
       <div className="ds-section-padding rounded-none xl:rounded-[3.5rem] bg-bg-page">
        <header className="flex items-center gap-4">
          <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-dark text-primary-foreground">
            <IconInfo className="size-5" />
          </div>
          <h2 className="min-w-0 font-heading text-ds-xxxl font-bold text-brand-dark">
            {title}
          </h2>
        </header>
        {subtitle ? (
          <p className="mt-4 font-heading text-ds-xs font-bold text-primary">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:items-center">
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
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6">
          {/* table-fixed + explicit column widths: column widths are derived from
              these headers, not the visible cell content — so filtering/searching
              (which changes the row set) never makes the columns jump. */}
          <ViewTransition>
          {/* Figma table (3393:7224): four equal columns with 24px gutters and a
              narrow Directions column with an icon-only button. The gutters
              are the cells' 12px side padding; the first and last columns sit
              flush with the card's content edge. */}
          <Table className="min-w-[920px] table-fixed">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="py-3 pl-0 pr-3 text-ds-xxs font-medium text-muted-foreground">Organization</TableHead>
                <TableHead className="px-3 text-ds-xxs font-medium text-muted-foreground">Service</TableHead>
                <TableHead className="px-3 text-ds-xxs font-medium text-muted-foreground">Contact</TableHead>
                <TableHead className="px-3 text-ds-xxs font-medium text-muted-foreground">Category</TableHead>
                <TableHead className="w-[72px] pl-3 pr-0 text-ds-xxs font-medium text-muted-foreground">Directions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id} className="border-border hover:bg-transparent">
                  <TableCell className="py-6 pl-0 pr-3 align-top text-ds-m font-bold whitespace-normal text-foreground">
                    {c.organization}
                  </TableCell>
                  <TableCell className="px-3 py-6 align-top text-ds-xxs font-medium whitespace-normal text-foreground">
                    {c.service}
                  </TableCell>
                  {/* One icon link per channel, in the frame's order: emails,
                      phones, social profiles, websites. Nothing renders for a
                      channel the organisation doesn't have; the <td> stays so
                      the columns line up. */}
                  <TableCell className="px-3 py-6 align-top">
                    {c.emails.length || c.phones.length || c.socials.length || c.websites.length ? (
                      <div className="space-y-2">
                        {c.emails.map((e) => (
                          <ChannelLink key={e} href={`mailto:${e}`} icon={<IconMail className="size-4 shrink-0" />}>
                            {e}
                          </ChannelLink>
                        ))}
                        {c.phones.map((p, i) => (
                          <ChannelLink key={`${p.number}-${i}`} href={telHref(p.number)} icon={<IconPhone className="size-4 shrink-0" />}>
                            {p.number}
                            {p.label ? <span className="font-medium text-muted-foreground"> · {p.label}</span> : null}
                          </ChannelLink>
                        ))}
                        {c.socials.map((s, i) => {
                          const { href, label } = socialLink(s);
                          return (
                            <ChannelLink
                              key={`${s.network}-${i}`}
                              href={href}
                              external
                              icon={<Icon name={SOCIAL_ICON[s.network] ?? "globe"} className="size-4 shrink-0" />}
                            >
                              {label}
                            </ChannelLink>
                          );
                        })}
                        {c.websites.map((w, i) => {
                          const { href, label } = websiteLink(w);
                          return (
                            <ChannelLink key={`${w.url}-${i}`} href={href} external icon={<Icon name="globe" className="size-4 shrink-0" />}>
                              {label}
                            </ChannelLink>
                          );
                        })}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="px-3 py-6 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {c.categories.map((slug) => {
                        const label = labelBySlug[slug] ?? slug;
                        return (
                          <button
                            key={slug}
                            type="button"
                            onClick={() => setCategory(slug)}
                            aria-label={`Filter contacts by ${label}`}
                            title={`Show only ${label}`}
                            className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/35"
                          >
                            <Tag className="max-w-full cursor-pointer justify-start whitespace-normal py-1 text-left leading-snug transition-colors hover:border-primary hover:text-primary">
                              {label}
                            </Tag>
                          </button>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="py-6 pl-3 pr-0 align-top">
                    {/* Icon-only, as in the frame; the name is in the accessible label. */}
                    <a
                      href={mapsHref(c.organization)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Get directions to ${c.organization}`}
                      title={`Get directions to ${c.organization}`}
                      className={buttonVariants({ size: "icon" })}
                    >
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
          </ViewTransition>
        </div>
       </div>
      </div>
    </section>
  );
}
