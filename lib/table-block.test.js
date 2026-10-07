import test from "node:test";
import assert from "node:assert/strict";

import {
  TABLE_MAX_COLUMNS,
  cellLines,
  hasHeaders,
  normalizeTableBlock,
  tableBlockToPayload,
} from "./table-block.js";

test("legacy label + items rows read as two columns", () => {
  const v = normalizeTableBlock({
    title: "Documents Required",
    rows: [
      { label: "Adults", items: [{ text: "Passport" }, { text: " Visa " }] },
      { label: "Kids", items: [] },
    ],
  });
  assert.deepEqual(v, {
    title: "Documents Required",
    headers: ["", ""],
    rows: [
      ["Adults", "Passport\n Visa "],
      ["Kids", ""],
    ],
  });
  assert.equal(hasHeaders(v.headers), false);
});

test("new shape keeps headers and pads short rows to the column count", () => {
  const v = normalizeTableBlock({
    columns: [{ header: "Risk" }, { header: "What it means" }, { header: "Warning signs" }],
    rows: [
      { cells: [{ text: "Cyberbullying" }, { text: "Hurtful messages" }, { text: "Sadness" }] },
      { cells: [{ text: "Grooming" }, { text: "Strangers asking" }] },
    ],
  });
  assert.deepEqual(v.headers, ["Risk", "What it means", "Warning signs"]);
  assert.deepEqual(v.rows[1], ["Grooming", "Strangers asking", ""]);
  assert.equal(hasHeaders(v.headers), true);
});

test("never more than the column cap, never fewer than two", () => {
  const wide = normalizeTableBlock({
    columns: [{ header: "a" }, { header: "b" }, { header: "c" }, { header: "d" }, { header: "e" }],
    rows: [{ cells: [1, 2, 3, 4, 5, 6].map((t) => ({ text: String(t) })) }],
  });
  assert.equal(wide.headers.length, TABLE_MAX_COLUMNS);
  assert.deepEqual(wide.rows[0], ["1", "2", "3", "4"]);

  const narrow = normalizeTableBlock({ columns: [{ header: "only" }], rows: [{ cells: [{ text: "x" }] }] });
  assert.deepEqual(narrow.headers, ["only", ""]);
  assert.deepEqual(narrow.rows, [["x", ""]]);
});

test("rows with no content are dropped; cells split into trimmed lines", () => {
  const v = normalizeTableBlock({
    rows: [{ cells: [{ text: " " }, { text: "" }] }, { cells: [{ text: "Keep" }, { text: "a\n\n b \n" }] }],
  });
  assert.equal(v.rows.length, 1);
  assert.deepEqual(cellLines(v.rows[0][1]), ["a", "b"]);
});

test("writes the new shape with one column entry per column", () => {
  const p = tableBlockToPayload({
    title: "T",
    headers: ["Risk", "", "Signs"],
    rows: [
      ["Cyberbullying", "Hurtful", "Sad"],
      ["", "", ""],
      ["Short"],
    ],
  });
  assert.equal(p.blockType, "table");
  assert.deepEqual(p.columns, [{ header: "Risk" }, { header: "" }, { header: "Signs" }]);
  assert.deepEqual(p.rows, [
    { cells: [{ text: "Cyberbullying" }, { text: "Hurtful" }, { text: "Sad" }] },
    { cells: [{ text: "Short" }, { text: "" }, { text: "" }] },
  ]);
});
