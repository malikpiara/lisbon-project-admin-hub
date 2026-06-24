import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import { TopicsList } from "./topics-list";

export const metadata = {
  title: "Topics · Studio (Payload)",
};

export default async function StudioTopicsPage() {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user) {
    redirect("/cms-admin/login");
  }

  // Light fetch (no article bodies) + a service-id → title map for display.
  const [{ docs: topics }, { docs: services }] = await Promise.all([
    payload.find({
      collection: "topics",
      sort: "title",
      limit: 1000,
      depth: 0,
      select: { title: true, description: true, service: true },
    }),
    payload.find({
      collection: "services",
      limit: 0,
      depth: 0,
      select: { title: true },
    }),
  ]);

  const serviceTitle = Object.fromEntries(services.map((s) => [s.id, s.title]));
  const rows = topics.map((t) => {
    const sid = typeof t.service === "object" ? t.service?.id : t.service;
    return {
      id: t.id,
      title: t.title ?? "",
      description: t.description ?? "",
      serviceTitle: serviceTitle[sid] ?? "",
    };
  });

  return <TopicsList topics={rows} />;
}
