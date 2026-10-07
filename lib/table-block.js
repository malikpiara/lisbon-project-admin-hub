// Content tables, one normalised shape for every reader: the public page
// (components/services/reference-table.tsx), the admin editor and its live
// preview, and the review diff (lib/flatten-topic.js). Pure, no Payload import.
//
// Two stored shapes exist. Until October 2026 a table was fixed at two columns:
// `rows[].label` (bold, left) + `rows[].items[].text` (bullets, right). Now a
// table has `columns[].header` (one per column, 2 to 4) and `rows[].cells[].text`
// (one per column; lines inside a cell render as bullets). Old rows are read as
// two cells, so nothing needs migrating: an article moves to the new shape the
// first time an editor saves it.
//
// The column cap is a readability constraint, not a technical one: at the
// site's 760px reading column a fourth column already needs the breakout the
// renderer applies, and a fifth would wrap every other word. Loosening a cap
// later costs one constant; tightening it costs a content migration.

export const TABLE_MIN_COLUMNS = 2;
export const TABLE_MAX_COLUMNS = 4;

const clean = (v) => (v == null ? "" : String(v));
const clampCols = (n) =>
  Math.min(TABLE_MAX_COLUMNS, Math.max(TABLE_MIN_COLUMNS, n));
const pad = (arr, n) => {
  const out = arr.slice(0, n);
  while (out.length < n) out.push("");
  return out;
};

/**
 * @typedef {{ title: string, headers: string[], rows: string[][] }} TableView
 * `headers` has one entry per column ("" when that column has no heading);
 * each row has one string per column, lines separated by "\n".
 */

/**
 * A Payload table block, in either stored shape → TableView.
 * @param {any} block
 * @returns {TableView}
 */
export function normalizeTableBlock(block) {
  const columns = (block?.columns ?? []).map((c) => clean(c?.header));
  const cellRows = (block?.rows ?? []).map((r) => {
    if (Array.isArray(r?.cells) && r.cells.length) {
      return r.cells.map((c) => clean(c?.text));
    }
    // Legacy two-column row.
    const items = (r?.items ?? [])
      .map((i) => clean(i?.text))
      .filter((t) => t.trim());
    return [clean(r?.label), items.join("\n")];
  });
  const widest = Math.max(columns.length, ...cellRows.map((c) => c.length), 0);
  const n = clampCols(widest);
  return {
    title: clean(block?.title),
    headers: pad(columns, n),
    rows: cellRows
      .map((cells) => pad(cells, n))
      .filter((cells) => cells.some((t) => t.trim())),
  };
}

/** One cell's lines, trimmed and non-empty. */
export function cellLines(cell) {
  return clean(cell)
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/** @param {string[]} headers */
export function hasHeaders(headers) {
  return (headers ?? []).some((h) => clean(h).trim());
}

/**
 * TableView → a Payload table block in the new shape. Empty rows are dropped;
 * `columns` always carries one entry per column so the width is explicit even
 * when no heading was typed.
 * @param {TableView} view
 */
export function tableBlockToPayload(view) {
  const n = clampCols((view?.headers ?? []).length);
  const rows = (view?.rows ?? [])
    .map((cells) => pad((cells ?? []).map(clean), n))
    .filter((cells) => cells.some((t) => t.trim()))
    .map((cells) => ({ cells: cells.map((text) => ({ text })) }));
  return {
    blockType: "table",
    title: clean(view?.title),
    columns: pad((view?.headers ?? []).map(clean), n).map((header) => ({ header })),
    rows,
  };
}
