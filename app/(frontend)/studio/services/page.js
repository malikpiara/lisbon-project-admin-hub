import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import { ServicesList } from "./services-list";

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
