import { test } from "node:test";
import assert from "node:assert/strict";

import { flattenTopic } from "./flatten-topic.js";

const withSections = (...sections) => ({
  title: "Getting a NIF",
  article: { sections },
});

test("flattens every block type, in order", () => {
  const doc = withSections({
    heading: "What you need",
    lead: "Bring these.",
    blocks: [
      { blockType: "text", text: "First paragraph.\n\nSecond paragraph." },
      { blockType: "list", ordered: false, items: [{ text: "Passport" }, { text: "Proof of address" }] },
      { blockType: "list", ordered: true, items: [{ text: "Book" }, { text: " Go " }] },
      {
        blockType: "table",
        title: "Documents Required",
        rows: [{ label: "Adults", items: [{ text: "Passport" }, { text: "Visa" }] }],
      },
      { blockType: "button", label: "Book a slot", href: "/contact" },
    ],
  });

  assert.equal(
    flattenTopic(doc),
    [
      "Getting a NIF",
      "What you need",
      "Bring these.",
      "First paragraph.\n\nSecond paragraph.",
      "• Passport",
      "• Proof of address",
      "1. Book",
      "2. Go",
      "Documents Required",
      "Adults\n• Passport\n• Visa",
      "[Book a slot] (/contact)",
    ].join("\n\n")
  );
});

test("still flattens legacy body/bullets/table/cta sections", () => {
  const doc = withSections({
    heading: "Old section",
    body: "Legacy body.",
    bullets: [{ text: "One" }, { text: "Two" }],
    ordered: true,
    table: { title: "", rows: [{ label: "Kids", items: [{ text: "Birth cert" }] }] },
    cta: "Call us",
    ctaHref: "",
  });

  assert.equal(
    flattenTopic(doc),
    ["Getting a NIF", "Old section", "Legacy body.", "1. One", "2. Two", "Kids\n• Birth cert", "[Call us]"].join(
      "\n\n"
    )
  );
});

test("migrating a legacy section to blocks is not a diff", () => {
  // Published (pre-blocks) vs the editor's first save of the same content.
  const legacy = withSections({
    heading: "Steps",
    body: "Do this.",
    bullets: [{ text: "A" }, { text: "B" }],
    ordered: false,
    table: { title: "Docs", rows: [{ label: "All", items: [{ text: "ID" }] }] },
    cta: "Start",
    ctaHref: "/start",
  });
  const migrated = withSections({
    heading: "Steps",
    blocks: [
      { blockType: "text", text: "Do this." },
      { blockType: "list", ordered: false, items: [{ text: "A" }, { text: "B" }] },
      { blockType: "table", title: "Docs", rows: [{ label: "All", items: [{ text: "ID" }] }] },
      { blockType: "button", label: "Start", href: "/start" },
    ],
    // Payload leaves the deprecated columns null once a section is re-saved.
    body: null,
    bullets: [],
    table: { title: null, rows: [] },
    cta: null,
  });

  assert.equal(flattenTopic(migrated), flattenTopic(legacy));
});

test("blocks win over leftover legacy fields, like the public page", () => {
  const doc = withSections({
    heading: "Mixed",
    body: "Stale legacy body",
    blocks: [{ blockType: "text", text: "Current body" }],
  });

  const flat = flattenTopic(doc);
  assert.match(flat, /Current body/);
  assert.doesNotMatch(flat, /Stale legacy body/);
});

test("edits inside blocks change the flattening", () => {
  const before = withSections({
    heading: "S",
    blocks: [
      { blockType: "text", text: "Hello" },
      { blockType: "list", items: [{ text: "Item" }] },
      { blockType: "table", title: "T", rows: [{ label: "L", items: [{ text: "x" }] }] },
      { blockType: "button", label: "Go", href: "/a" },
    ],
  });
  const edits = [
    (s) => (s.blocks[0].text = "Hello there"),
    (s) => (s.blocks[1].items[0].text = "Item 2"),
    (s) => (s.blocks[1].ordered = true),
    (s) => (s.blocks[2].rows[0].items[0].text = "y"),
    (s) => (s.blocks[3].href = "/b"),
  ];
  for (const edit of edits) {
    const after = structuredClone(before);
    edit(after.article.sections[0]);
    assert.notEqual(flattenTopic(after), flattenTopic(before), edit.toString());
  }
});

test("tolerates missing docs and articles", () => {
  assert.equal(flattenTopic(null), "");
  assert.equal(flattenTopic({ title: "Only a title" }), "Only a title");
});
