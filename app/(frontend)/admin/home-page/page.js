import { authedPayload } from "@/lib/admin-auth";
import { auditLabels } from "@/lib/format-audit";
import { withHomePageDefaults } from "@/lib/home-page-defaults";
import { HomePageEditor } from "./home-page-editor";

export const metadata = {
  title: "Home page · Admin",
};

export default async function AdminHomePagePage() {
  const { payload, user } = await authedPayload();

  // draft: true loads the newest draft when one is pending review — the editor
  // must show the submitted text, not silently revert to the published copy.
  // depth: 1 populates updatedBy for the audit line. Before the first save the
  // global is empty, so the shipped defaults fill every field.
  const doc = await payload
    .findGlobal({ slug: "home-page", depth: 1, draft: true })
    .catch(() => null);
  // Not `doc._status === "draft"`: a never-saved global reads back with
  // _status "draft" (the field's default). Pending = the latest saved version
  // is a draft — the same test the Review queue uses.
  const pending = await payload
    .countGlobalVersions({
      global: "home-page",
      where: {
        latest: { equals: true },
        "version._status": { equals: "draft" },
      },
    })
    .catch(() => null);

  return (
    <HomePageEditor
      initial={withHomePageDefaults(doc)}
      isAdmin={user.role === "admin"}
      pendingReview={(pending?.totalDocs ?? 0) > 0}
      // A global has no meaningful "created"; show last modified only.
      audit={doc?.updatedAt ? { modified: auditLabels(doc).modified } : null}
    />
  );
}
