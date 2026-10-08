// One place that turns Payload's draft/version facts into the state an
// editor sees. Payload gives us three facts: whether the newest version is a
// draft, whether a published version exists at all, and (our own flag)
// whether the newest draft was submitted for review. Everything in the admin
// that shows or labels publishing state goes through here, so the chip in the
// editor, the list and the save bar can never disagree.

/**
 * @param {{ latestIsDraft: boolean, hasPublished: boolean, reviewRequested?: boolean }} facts
 * @returns {{
 *   key: "draft" | "in-review" | "published" | "published-changes" | "published-in-review",
 *   label: string,
 *   live: boolean,
 *   pendingDraft: boolean,
 *   description: string,
 * }}
 */
export function publishState({ latestIsDraft, hasPublished, reviewRequested = false }) {
  if (!hasPublished) {
    return reviewRequested
      ? {
          key: "in-review",
          label: "In review",
          live: false,
          pendingDraft: true,
          description: "Submitted for review. It goes live once an admin publishes it.",
        }
      : {
          key: "draft",
          label: "Draft",
          live: false,
          pendingDraft: latestIsDraft,
          description: "Not on the live site yet.",
        };
  }
  if (!latestIsDraft) {
    return {
      key: "published",
      label: "Published",
      live: true,
      pendingDraft: false,
      description: "This is what visitors see.",
    };
  }
  return reviewRequested
    ? {
        key: "published-in-review",
        label: "Published · changes in review",
        live: true,
        pendingDraft: true,
        description: "The live page shows the last published version; an admin has changes to review.",
      }
    : {
        key: "published-changes",
        label: "Published · unpublished changes",
        live: true,
        pendingDraft: true,
        description: "The live page shows the last published version; newer changes are saved as a draft.",
      };
}
