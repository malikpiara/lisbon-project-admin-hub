import { authedPayload } from "@/lib/admin-auth";
import { TopicsList } from "./topics-list";

export const metadata = {
  title: "Topics · Admin",
};

export default async function AdminTopicsPage() {
  const { payload } = await authedPayload();

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
