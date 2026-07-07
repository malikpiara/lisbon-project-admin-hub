import { authedPayload } from "@/lib/admin-auth";
import { ArticlesList } from "./articles-list";

export const metadata = {
  title: "Articles · Admin",
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
      sort: "order",
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

  // New articles are created under the first service (order 0); the editor's
  // service dropdown lets the author reassign immediately.
  return <ArticlesList topics={rows} defaultServiceId={services[0]?.id ?? null} />;
}
