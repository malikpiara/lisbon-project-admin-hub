"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoveControls } from "@/components/admin/editor-ui";
import { getServiceIcon, getServiceIconKey } from "@/lib/service-icons";
import { createService, reorderServices } from "./actions";

export function ServicesList({ services, userEmail }) {
  const router = useRouter();
  const [reordering, startReorder] = useTransition();

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= services.length) return;
    const ids = services.map((s) => s.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    startReorder(async () => {
      await reorderServices(ids);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-ds-xxl font-bold text-foreground">
            Services &amp; Information
          </h1>
          <p className="mt-1 text-ds-xs font-medium text-muted-foreground">
            {services.length} categories, in the order they appear on the home
            page.
          </p>
        </div>
        <form action={createService}>
          <Button size="sm" type="submit">
            <Plus />
            Add category
          </Button>
        </form>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {services.map((service, i) => {
          const Icon = getServiceIcon(
            getServiceIconKey(service.slug, service.iconKey)
          );
          return (
            <Card key={service.id} className="h-full">
              <Link
                href={`/studio/services/${service.id}`}
                className="group flex flex-1 items-start gap-4 px-4 outline-none xl:px-6"
              >
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
                    {service.topicCount} topic{service.topicCount === 1 ? "" : "s"}{" "}
                    · {service.contactCount} contact
                    {service.contactCount === 1 ? "" : "s"}
                  </p>
                </div>
                <ChevronRight className="mt-1 size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
              </Link>
              <div className="flex items-center justify-between px-4 xl:px-6">
                <span className="text-ds-xxs font-bold text-muted-foreground">
                  #{i + 1}
                </span>
                <MoveControls
                  onMoveUp={() => move(i, -1)}
                  onMoveDown={() => move(i, 1)}
                  isFirst={i === 0}
                  isLast={i === services.length - 1}
                  disabled={reordering}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
