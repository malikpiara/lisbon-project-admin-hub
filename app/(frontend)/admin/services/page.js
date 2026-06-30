import { authedPayload } from "@/lib/admin-auth";
import { ServicesList } from "./services-list";

export const metadata = {
  title: "Services · Admin",
};

export default async function AdminServicesPage() {
  const { payload, user } = await authedPayload();

  // Independent reads — run them together rather than one after the other.
  // One topics query feeds a service-id → count map (avoids N per-service queries).
  const [{ docs: services }, { docs: topics }] = await Promise.all([
    payload.find({
      collection: "services",
      sort: "order",
      limit: 100,
      depth: 0,
    }),
    payload.find({
      collection: "topics",
      limit: 0,
      depth: 0,
      select: { service: true },
    }),
  ]);
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
