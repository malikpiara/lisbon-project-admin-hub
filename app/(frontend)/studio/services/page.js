import Link from "next/link";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getServiceIcon, getServiceIconKey } from "@/lib/service-icons";
import { createService } from "./actions";

export const metadata = {
  title: "Services · Studio (Payload)",
};

export default async function StudioServicesPage() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user) {
    redirect("/cms-admin/login");
  }

  const { docs: services } = await payload.find({
    collection: "services",
    sort: "order",
    limit: 100,
    depth: 0,
  });

  // One query for all topics → a service-id → count map (avoids N queries).
  const { docs: topics } = await payload.find({
    collection: "topics",
    limit: 0,
    depth: 0,
    select: { service: true },
  });
  const topicCount = topics.reduce((acc, t) => {
    const sid = typeof t.service === "object" ? t.service?.id : t.service;
    acc[sid] = (acc[sid] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-ds-xxl font-bold text-foreground">
            Services &amp; Information
          </h1>
          <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
            {services.length} categories · Payload-backed · signed in as{" "}
            {user.email}
          </p>
        </div>
        <form action={createService}>
          <Button size="sm" type="submit">
            <Plus />
            Add category
          </Button>
        </form>
      </div>

      <p className="mt-3 text-ds-xxs font-medium text-muted-foreground">
        Comparison: the localStorage prototype is at{" "}
        <a className="text-brand-link underline" href="/admin/services">
          /admin/services
        </a>
        .
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {services.map((service) => {
          const Icon = getServiceIcon(
            getServiceIconKey(service.slug, service.iconKey)
          );
          const tCount = topicCount[service.id] ?? 0;
          const cCount = service.contacts?.length ?? 0;
          return (
            <Link
              key={service.id}
              href={`/studio/services/${service.id}`}
              className="group rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <div className="flex items-start gap-4 px-4 xl:px-6">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <Icon className="size-5" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-heading text-ds-s font-bold text-foreground">
                      {service.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-ds-xs font-medium text-muted-foreground">
                      {service.shortDescription || "No short description"}
                    </p>
                    <p className="mt-3 text-ds-xxs font-medium text-muted-foreground">
                      {tCount} topic{tCount === 1 ? "" : "s"} · {cCount} contact
                      {cCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
