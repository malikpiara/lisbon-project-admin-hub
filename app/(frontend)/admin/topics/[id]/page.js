import { notFound } from "next/navigation";

import { authedPayload } from "@/lib/admin-auth";
import { auditLabels } from "@/lib/format-audit";
import { TopicEditor } from "./topic-editor";

export const metadata = {
  title: "Edit topic · Admin",
};

export default async function AdminTopicEditPage({ params }) {
  const { id } = await params;
  const { payload } = await authedPayload();

  let topic;
  try {
    // depth: 1 populates the service relationship + createdBy/updatedBy users.
    topic = await payload.findByID({ collection: "topics", id, depth: 1 });
  } catch {
    notFound();
  }
  if (!topic) notFound();

  // The service relationship is already populated by depth: 1 — reuse it for the
  // breadcrumb + "View on site" URL instead of a second findByID. Trim it to the
  // three fields the editor needs, and drop the populated copy from the topic so
  // the full service isn't serialized to the client twice.
  const svc =
    topic.service && typeof topic.service === "object" ? topic.service : null;
  const service = svc
    ? { id: svc.id, title: svc.title, slug: svc.slug }
    : null;
  const { service: _service, ...topicForClient } = topic;

  // All services, for the reassignment dropdown (id + title, in page order).
  const { docs: allServices } = await payload.find({
    collection: "services",
    limit: 100,
    depth: 0,
    select: { title: true, slug: true },
    sort: "order",
  });
  const services = allServices.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
  }));

  return (
    <TopicEditor
      topic={topicForClient}
      service={service}
      services={services}
      audit={auditLabels(topic)}
    />
  );
}
