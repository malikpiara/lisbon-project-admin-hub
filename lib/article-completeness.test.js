import test from "node:test";
import assert from "node:assert/strict";

import { STUB_TITLE, articleCompleteness, blockHasContent } from "./article-completeness.js";

const section = (heading, blocks) => ({ heading, blocks });

test("a fresh stub is missing all three things", () => {
  const r = articleCompleteness({ title: STUB_TITLE, description: "", article: { sections: [] } });
  assert.equal(r.complete, false);
  assert.equal(r.missing.length, 3);
});

test("title, description and one filled section make it complete", () => {
  const r = articleCompleteness({
    title: "How to get a NIF",
    description: "The tax number you need for almost everything.",
    article: { sections: [section("What is it?", [{ blockType: "text", text: "A number." }])] },
  });
  assert.deepEqual(r, { complete: true, missing: [] });
});

test("a heading with no content does not count as a filled section", () => {
  const r = articleCompleteness({
    title: "Housing",
    description: "Where to start.",
    article: { sections: [section("What is it?", [{ blockType: "text", text: "  " }]), section("", [{ blockType: "text", text: "orphan" }])] },
  });
  assert.equal(r.complete, false);
  assert.match(r.missing[0], /one section/);
});

test("legacy fixed fields still count as content", () => {
  const r = articleCompleteness({
    title: "Old article",
    description: "Still fine.",
    article: { sections: [{ heading: "Steps", body: "Do this." }] },
  });
  assert.equal(r.complete, true);
});

test("tables count in both stored shapes; empty tables do not", () => {
  assert.equal(blockHasContent({ blockType: "table", rows: [{ cells: [{ text: "Risk" }] }] }), true);
  assert.equal(blockHasContent({ blockType: "table", rows: [{ label: "Adults", items: [] }] }), true);
  assert.equal(blockHasContent({ blockType: "table", rows: [{ cells: [{ text: " " }] }] }), false);
  assert.equal(blockHasContent({ blockType: "button", label: "" }), false);
});
