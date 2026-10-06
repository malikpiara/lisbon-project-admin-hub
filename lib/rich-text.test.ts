// Run: pnpm test. Fixtures are real article text from the live site
// (2026-10-06) — the cases that broke naive renderers.
import assert from "node:assert/strict";
import { test } from "node:test";

import { parseInline, parseRichText, stripListMarker, toPlainText } from "./rich-text";
import { fromEditorJSON, toEditorHTML } from "./rich-text-editor";

test("single Enter is a line break, blank line a new paragraph", () => {
  assert.deepEqual(parseRichText("One\nTwo\n\nThree"), [
    { kind: "p", lines: ["One", "Two"] },
    { kind: "p", lines: ["Three"] },
  ]);
});

test("a numbered step alone in its block keeps the author's number", () => {
  // Editors put each step in its own text block: "2. 7:11 Breathing".
  const [first] = parseRichText("2. 7:11 Breathing\n\nThis helps your body calm down.");
  assert.deepEqual(first, { kind: "list", ordered: true, start: 2, items: [["7:11 Breathing"]] });
});

test("indented lines under a list item stay inside it", () => {
  const blocks = parseRichText(
    "1. Online\n2. In-person at a Metro Station: \n     A. Standard (10 days): Colégio Militar/Luz\n         Zoológico\n3. Navegante point"
  );
  assert.equal(blocks.length, 1);
  const list = blocks[0];
  assert.ok(list.kind === "list");
  assert.equal(list.items.length, 3);
  assert.deepEqual(list.items[1], [
    "In-person at a Metro Station:",
    "A. Standard (10 days): Colégio Militar/Luz",
    "Zoológico",
  ]);
});

test("'- ', '• ' and pasted '* ' bullets all make a bulleted list", () => {
  for (const marker of ["-", "•", "*"]) {
    const [b] = parseRichText(`${marker} Passport\n${marker} NIF`);
    assert.deepEqual(b, { kind: "list", ordered: false, start: 1, items: [["Passport"], ["NIF"]] });
  }
});

test("bold and italic, as editors already paste them", () => {
  assert.deepEqual(parseInline("To apply for **Porta 65 Jovem**, you must"), [
    { kind: "text", text: "To apply for " },
    { kind: "bold", children: [{ kind: "text", text: "Porta 65 Jovem" }] },
    { kind: "text", text: ", you must" },
  ]);
  assert.deepEqual(parseInline("promise (*Contrato-Promessa de Arrendamento*)."), [
    { kind: "text", text: "promise (" },
    { kind: "italic", text: "Contrato-Promessa de Arrendamento" },
    { kind: "text", text: ")." },
  ]);
});

test("unmatched or arithmetic asterisks stay literal", () => {
  for (const s of ["the RMR)** for your area", "5 * 3 = 15 and 2 ** 3", "snake*case*here"]) {
    assert.deepEqual(parseInline(s), [{ kind: "text", text: s }]);
  }
});

test("calling the parser repeatedly never skips matches (no shared /g state)", () => {
  for (let i = 0; i < 3; i++) {
    assert.equal(parseInline("**a** and **b**").filter((s) => s.kind === "bold").length, 2);
  }
});

test("stripListMarker drops a typed bullet inside a list item", () => {
  assert.equal(stripListMarker("- Passport"), "Passport");
  assert.equal(stripListMarker("3) Step"), "Step");
  assert.equal(stripListMarker("2026 budget"), "2026 budget");
});

test("toPlainText removes markers for meta descriptions", () => {
  assert.equal(
    toPlainText("**Bold** and [a link](https://x.pt)\n- item *one*"),
    "Bold and a link item one"
  );
});

test("visual editor: stored text → editor HTML keeps numbers, escapes HTML, drops unsafe links", () => {
  assert.equal(toEditorHTML("2. Step"), '<ol start="2"><li><p>Step</p></li></ol>');
  assert.equal(toEditorHTML("a <b>tag</b>"), "<p>a &lt;b&gt;tag&lt;/b&gt;</p>");
  assert.equal(toEditorHTML("[x](javascript:alert(1))"), "<p>[x](javascript:alert(1))</p>");
  assert.equal(toEditorHTML("[site](https://x.pt)"), '<p><a href="https://x.pt">site</a></p>');
});

test("visual editor: editor JSON → stored text in the same format", () => {
  const doc = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Bring " },
          { type: "text", text: "your", marks: [{ type: "bold" }] },
          { type: "text", text: " passport", marks: [{ type: "bold" }] },
          { type: "hardBreak" },
          { type: "text", text: "and ", marks: [] },
          { type: "text", text: "this form", marks: [{ type: "link", attrs: { href: "https://x.pt" } }, { type: "bold" }] },
        ],
      },
      {
        type: "orderedList",
        attrs: { start: 3 },
        content: [
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Third" }] }] },
          { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Fourth" }] }] },
        ],
      },
    ],
  };
  assert.equal(
    fromEditorJSON(doc),
    "Bring **your passport**\nand **[this form](https://x.pt)**\n\n3. Third\n4. Fourth"
  );
});
