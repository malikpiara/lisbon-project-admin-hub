import { notFound } from "next/navigation";

import { authedPayload } from "@/lib/admin-auth";
import { auditLabels } from "@/lib/format-audit";
import { ContactEditor } from "./contact-editor";

export const metadata = {
  title: "Edit contact · Admin",
};

export default async function AdminContactEditPage({ params }) {
  const { id } = await params;
  const { payload } = await authedPayload();

  // depth: 1 populates `categories` (Service objects, normalised to ids in the
  // editor) and createdBy/updatedBy for the audit line. Load the full service
  // list in parallel for the category multiselect options.
  const contactPromise = payload
    .findByID({ collection: "contacts", id, depth: 1 })
    .catch(() => null);
  const servicesPromise = payload.find({
    collection: "services",
    sort: "order",
    limit: 100,
    depth: 0,
  });

  const contact = await contactPromise;
  if (!contact) notFound();
  const { docs: services } = await servicesPromise;

  return (
    <ContactEditor
      contact={contact}
      services={services.map((s) => ({ id: s.id, title: s.title }))}
      audit={auditLabels(contact)}
    />
  );
}
