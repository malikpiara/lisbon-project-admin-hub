import { notFound } from "next/navigation";

import { authedPayload } from "@/lib/admin-auth";
import { auditLabels } from "@/lib/format-audit";
import { diffSnapshots } from "@/lib/diff-versions";
import { ServiceEditor } from "./service-editor";

// Fields shown in the version diff, in display order.
const DIFF_FIELDS = [
  { key: "title", label: "Title", type: "text" },
  { key: "breadcrumb", label: "Breadcrumb", type: "text" },
  { key: "shortDescription", label: "Short description", type: "text" },
  { key: "iconKey", label: "Icon", type: "text" },
  { key: "contactsTitle", label: "Contacts title", type: "text" },
  { key: "contactsSubtitle", label: "Contacts subtitle", type: "text" },
  { key: "intro", label: "Intro paragraphs", type: "array" },
  { key: "categoryFilters", label: "Category filters", type: "array" },
  { key: "contacts", label: "Contacts", type: "array" },
];

export const metadata = {
  title: "Edit service · Admin",
};

export default async function AdminServiceEditPage({ params }) {
  const { id } = await params;
  const { payload } = await authedPayload();

  // Topics and versions only need the URL id, not the service result — so start
  // all three reads together and await them after, instead of waterfalling.
  // depth: 1 on the service populates createdBy/updatedBy users for the audit line.
  const servicePromise = payload
    .findByID({ collection: "services", id, depth: 1 })
    .catch(() => null);
  const topicsPromise = payload.find({
    collection: "topics",
    where: { service: { equals: id } },
    sort: "order",
    limit: 100,
    depth: 0,
  });
  // PROTOTYPE (#2): version history for the restore panel.
  const versionsPromise = payload
    .findVersions({
      collection: "services",
      where: { parent: { equals: id } },
      sort: "-updatedAt",
      limit: 15,
      depth: 1,
    })
    .catch(() => ({ docs: [] }));

  const service = await servicePromise;
  if (!service) notFound();
  const { docs: topics } = await topicsPromise;
  const { docs: versionDocs } = await versionsPromise;

  // versionDocs are newest-first; each entry's diff is vs the chronologically
  // previous (older) snapshot — i.e. "what this save changed".
  const versions = versionDocs.map((v, i) => {
    const by = v.version?.updatedBy;
    const prev = versionDocs[i + 1]?.version ?? null;
    return {
      id: v.id,
      who:
        (by && typeof by === "object" ? by.name || by.email : null) || "Unknown",
      at: v.updatedAt
        ? new Date(v.updatedAt).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "",
      changes: diffSnapshots(prev, v.version, DIFF_FIELDS),
    };
  });

  return (
    <ServiceEditor
      service={service}
      topics={topics}
      audit={auditLabels(service)}
      versions={versions}
    />
  );
}
