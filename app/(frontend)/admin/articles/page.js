import { authedPayload } from "@/lib/admin-auth";
import { publishState } from "@/lib/publish-state";
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
      select: { title: true, description: true, service: true, _status: true },
    }),
    payload.find({
      collection: "services",
      sort: "order",
      limit: 0,
      depth: 0,
      select: { title: true },
    }),
  ]);

  // Which articles have a submitted draft waiting — one indexed query, so the
  // list can say "In review" without reading every draft.
  const { docs: submitted } = await payload.findVersions({
    collection: "topics",
    where: {
      latest: { equals: true },
      "version._status": { equals: "draft" },
      "version.reviewRequested": { equals: true },
    },
    limit: 1000,
    depth: 0,
  });
  const inReview = new Set(
    submitted.map((v) => String(typeof v.parent === "object" ? v.parent?.id : v.parent))
  );

  const serviceTitle = Object.fromEntries(services.map((s) => [s.id, s.title]));
  const rows = topics.map((t) => {
    const sid = typeof t.service === "object" ? t.service?.id : t.service;
    const reviewing = inReview.has(String(t.id));
    const state = publishState({
      latestIsDraft: reviewing,
      hasPublished: t._status === "published",
      reviewRequested: reviewing,
    });
    return {
      id: t.id,
      title: t.title ?? "",
      description: t.description ?? "",
      serviceTitle: serviceTitle[sid] ?? "",
      // Published is the default and says nothing; every other state is a chip.
      stateLabel: state.key === "published" ? "" : state.label,
    };
  });

  // New articles are created under the first service (order 0); the editor's
  // service dropdown lets the author reassign immediately.
  return <ArticlesList topics={rows} defaultServiceId={services[0]?.id ?? null} />;
}
