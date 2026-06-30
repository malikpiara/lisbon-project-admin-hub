import { authedPayload } from "@/lib/admin-auth";
import { ServicesList } from "./services-list";

export const metadata = {
  title: "Services · Admin",
};

export default async function AdminServicesPage() {
  const { payload, user } = await authedPayload();

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

  const serviceData = services.map((s) => ({
    id: s.id,
    title: s.title,
    shortDescription: s.shortDescription || "",
    slug: s.slug,
    iconKey: s.iconKey || "",
    topicCount: topicCount[s.id] ?? 0,
    contactCount: s.contacts?.length ?? 0,
  }));

  return <ServicesList services={serviceData} userEmail={user.email} />;
}
