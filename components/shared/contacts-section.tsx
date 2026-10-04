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
  IconFacebook,
  IconGlobe,
  IconInfo,
  IconInstagram,
  IconLinkedin,
  IconMail,
  IconPhone,
  IconSearch,
  IconWhatsapp,
} from "@/components/icons/ds-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Social = {
  network: "instagram" | "facebook" | "linkedin" | "whatsapp" | "other";
  handle: string;
};
export type Contact = {
  id: string;
  organization: string;
  service: string;
  // PROTOTYPE (team feedback · Rafael's contacts layout): repeatable channels.
  // Every list may be empty — a row renders only the channels it has.
  phones: { number: string; label?: string }[];
  emails: string[];
  websites: { url: string; label?: string }[];
  socials: Social[];
  address: string;
  openingHours: string;
  // Service slugs this contact belongs to — the single taxonomy. A contact can
  // sit in several categories and surfaces on each of their pages.
  categories: string[];
};

export type CategoryOption = { value: string; label: string };

// Directions: the real address when the team has entered one, else the old
// "<organisation>, Lisbon" search.
function mapsHref(c: Contact) {
  const q = c.address.trim() ? c.address.trim() : `${c.organization}, Lisbon`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

const SOCIAL_ICON = {
  instagram: IconInstagram,
  facebook: IconFacebook,
  linkedin: IconLinkedin,
  whatsapp: IconWhatsapp,
  other: IconGlobe,
} as const;

// Turn a stored handle into a link + label. "@name" → the network's profile
// URL; a full URL stays as is; a WhatsApp number → wa.me.
function socialLink(s: Social): { href: string; label: string } {
  const h = s.handle.trim();
  if (/^https?:\/\//i.test(h)) {
    const label = h.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");
    return { href: h, label };
  }
  const bare = h.replace(/^@/, "");
  switch (s.network) {
    case "instagram":
      return { href: `https://instagram.com/${bare}`, label: `@${bare}` };
    case "facebook":
      return { href: `https://facebook.com/${bare}`, label: bare };
    case "linkedin":
      return { href: `https://linkedin.com/company/${bare}`, label: bare };
    case "whatsapp":
      return { href: `https://wa.me/${bare.replace(/[^\d]/g, "")}`, label: h };
    default:
      return { href: `https://${bare}`, label: bare };
  }
}

const channelClass =
  "flex items-center gap-2 text-ds-xxs font-bold text-primary hover:underline";

function ChannelLink({
  href,
  icon: Icon,
  children,
  external = false,
}: {
  href: string;
  icon: (p: { className?: string }) => React.ReactNode;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      className={channelClass}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <Icon className="size-4 shrink-0" />
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
        c.address.toLowerCase().includes(q)
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
          <ViewTransition>
          <Table className="min-w-[920px] table-fixed">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {/* Column names + the icon-only Directions button follow
                    Rafael's layout (Figma 3393:7225). */}
                <TableHead className="w-[22%] py-3 text-ds-xxs font-medium text-muted-foreground">Organization</TableHead>
                <TableHead className="w-[26%] text-ds-xxs font-medium text-muted-foreground">Service</TableHead>
                <TableHead className="w-[26%] text-ds-xxs font-medium text-muted-foreground">Contact</TableHead>
                <TableHead className="w-[20%] text-ds-xxs font-medium text-muted-foreground">Category</TableHead>
                <TableHead className="w-[96px] text-right text-ds-xxs font-medium text-muted-foreground">Directions</TableHead>
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
                    {c.openingHours.trim() ? (
                      <div className="mt-3">
                        <p className="font-bold">Opening hours:</p>
                        {c.openingHours
                          .split("\n")
                          .map((l) => l.trim())
                          .filter(Boolean)
                          .map((l, i) => (
                            <p key={i}>{l}</p>
                          ))}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="py-5 align-top">
                    {/* One row per channel, nothing for a missing one — the old
                        single email/phone drew a bare icon when blank. */}
                    <div className="space-y-2">
                      {c.emails.map((e) => (
                        <ChannelLink key={e} href={`mailto:${e}`} icon={IconMail}>
                          {e}
                        </ChannelLink>
                      ))}
                      {/* tel: href strips spaces/punctuation (keep digits + leading
                          +) so it dials correctly; the label stays formatted. */}
                      {c.phones.map((p) => (
                        <ChannelLink
                          key={p.number}
                          href={`tel:${p.number.replace(/[^\d+]/g, "")}`}
                          icon={IconPhone}
                        >
                          {p.number}
                          {p.label ? (
                            <span className="font-medium text-muted-foreground"> · {p.label}</span>
                          ) : null}
                        </ChannelLink>
                      ))}
                      {c.socials.map((s, i) => {
                        const { href, label } = socialLink(s);
                        return (
                          <ChannelLink key={`${s.network}-${i}`} href={href} icon={SOCIAL_ICON[s.network] ?? IconGlobe} external>
                            {label}
                          </ChannelLink>
                        );
                      })}
                      {c.websites.map((w) => (
                        <ChannelLink key={w.url} href={w.url} icon={IconGlobe} external>
                          {w.label || w.url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "")}
                        </ChannelLink>
                      ))}
                      {!c.emails.length && !c.phones.length && !c.socials.length && !c.websites.length ? (
                        <span className="text-ds-xxs font-medium text-muted-foreground">—</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="py-5 align-top">
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
                  <TableCell className="py-5 text-right align-top">
                    <a
                      href={mapsHref(c)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Directions to ${c.organization}`}
                      title={c.address.trim() ? c.address.trim() : "Search on Google Maps"}
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
    </section>
  );
}
