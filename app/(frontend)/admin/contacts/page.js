import Link from "next/link";
import { IconArrowRight, IconPlus } from "@/components/icons/ds-icons";

import { authedPayload } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { createContact } from "./actions";

export const metadata = {
  title: "Contacts · Admin",
};

// The global contacts directory. Data is READ here from Payload's Local API and
// WRITTEN via server actions — the same split as the other Payload-backed admin
// editors. Contacts are tagged with service categories (many-to-many); the list
// shows those tags so an editor can see at a glance where each one surfaces.
export default async function AdminContactsPage() {
  const { payload } = await authedPayload();

  // depth: 1 populates `categories` into Service objects so we can show titles.
  const { docs } = await payload.find({
    collection: "contacts",
    sort: "organization",
    limit: 200,
    depth: 1,
  });

  return (
    <div className="mx-auto max-w-5xl px-8 pt-12 pb-28">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-ds-xxl font-bold text-foreground">
            Contacts
          </h1>
          <p className="mt-2 max-w-2xl text-ds-xs font-medium leading-relaxed text-muted-foreground">
            The directory behind the “All Contacts” table and every category
            page. Each contact is tagged with the services it belongs to.
          </p>
        </div>
        <form action={createContact}>
          <Button size="sm" type="submit">
            <IconPlus className="size-3.5" />
            Add contact
          </Button>
        </form>
      </div>

      <div className="mt-8 space-y-2.5">
        {docs.length === 0 ? (
          <p className="rounded-lg border-2 border-dashed border-border p-10 text-center text-ds-xs font-medium text-muted-foreground">
            No contacts yet. Add the first one.
          </p>
        ) : (
          docs.map((c) => {
            const cats = Array.isArray(c.categories) ? c.categories : [];
            return (
              <Link
                key={c.id}
                href={`/admin/contacts/${c.id}`}
                className="group flex items-center gap-4 rounded-lg border-2 border-border bg-card px-5 py-4 outline-none transition-colors hover:border-foreground/20 focus-visible:bg-secondary/40"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-ds-xs font-bold text-foreground">
                    {c.organization || "Untitled contact"}
                  </span>
                  {c.email ? (
                    <span className="block truncate text-ds-xxs font-medium text-muted-foreground">
                      {c.email}
                    </span>
                  ) : null}
                </div>
                <div className="hidden max-w-[45%] flex-wrap justify-end gap-1.5 sm:flex">
                  {cats.map((cat) => (
                    <Tag key={typeof cat === "object" ? cat.id : cat}>
                      {typeof cat === "object" ? cat.title : cat}
                    </Tag>
                  ))}
                </div>
                <IconArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
