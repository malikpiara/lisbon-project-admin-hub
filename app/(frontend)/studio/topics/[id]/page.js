import { headers as nextHeaders } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

import { auditLabels } from "@/lib/format-audit";
import { TopicEditor } from "./topic-editor";

export const metadata = {
  title: "Edit topic · Studio (Payload)",
};

export default async function StudioTopicEditPage({ params }) {
  const { id } = await params;
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user) {
    redirect("/cms-admin/login");
  }

  let topic;
  try {
    // depth: 1 populates the service relationship + createdBy/updatedBy users.
    topic = await payload.findByID({ collection: "topics", id, depth: 1 });
  } catch {
    notFound();
  }
  if (!topic) notFound();

  // Resolve the parent service (for the breadcrumb + "View on site" URL).
  const serviceId =
    typeof topic.service === "object" ? topic.service?.id : topic.service;
  let service = null;
  if (serviceId) {
    try {
      service = await payload.findByID({
        collection: "services",
        id: serviceId,
        depth: 0,
      });
    } catch {
      service = null;
    }
  }

  return (
    <TopicEditor topic={topic} service={service} audit={auditLabels(topic)} />
  );
}
