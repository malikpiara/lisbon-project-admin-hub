import test from "node:test";
import assert from "node:assert/strict";

import { publishState } from "./publish-state.js";

test("never published: Draft, or In review once submitted", () => {
  assert.equal(publishState({ latestIsDraft: true, hasPublished: false }).key, "draft");
  assert.equal(publishState({ latestIsDraft: true, hasPublished: false, reviewRequested: true }).key, "in-review");
  assert.equal(publishState({ latestIsDraft: true, hasPublished: false }).live, false);
});

test("published with nothing newer", () => {
  const s = publishState({ latestIsDraft: false, hasPublished: true });
  assert.equal(s.key, "published");
  assert.equal(s.live, true);
  assert.equal(s.pendingDraft, false);
});

test("published with a newer draft, submitted or not", () => {
  assert.equal(publishState({ latestIsDraft: true, hasPublished: true }).key, "published-changes");
  assert.equal(publishState({ latestIsDraft: true, hasPublished: true, reviewRequested: true }).key, "published-in-review");
  assert.equal(publishState({ latestIsDraft: true, hasPublished: true }).live, true);
});
