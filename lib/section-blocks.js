// A Payload section → an ordered array of view-shape content blocks. When the
// section has `blocks`, map them directly. Otherwise synthesise blocks from the
// deprecated fixed fields (body → text, bullets → list, table → table, cta →
// button) so pre-blocks content keeps rendering with no data migration.
//
// Pure (no Payload import) so both the public adapter (lib/content.js) and the
// review diff (lib/flatten-topic.js) read sections exactly the same way.
//
// Tables come out as { type: "table", title, headers, rows } — see
// lib/table-block.js, which also reads the pre-October-2026 two-column rows.
import { normalizeTableBlock } from "./table-block.js";

export function sectionBlocks(s) {
  const raw = s.blocks ?? [];
  if (raw.length) {
    return raw
      .map((b) => {
        if (b.blockType === "text") return { type: "text", body: b.text ?? "" };
        if (b.blockType === "list")
          return {
            type: "list",
            ordered: !!b.ordered,
            items: (b.items ?? []).map((i) => i.text),
          };
        if (b.blockType === "table") return { type: "table", ...normalizeTableBlock(b) };
        if (b.blockType === "button")
          return { type: "button", label: b.label ?? "", href: b.href ?? "" };
        return null;
      })
      .filter(Boolean);
  }
  const out = [];
  if ((s.body ?? "").trim()) out.push({ type: "text", body: s.body });
  const bullets = (s.bullets ?? []).map((b) => b.text).filter(Boolean);
  if (bullets.length)
    out.push({ type: "list", ordered: !!s.ordered, items: bullets });
  const table = normalizeTableBlock({ title: s.table?.title, rows: s.table?.rows });
  if (table.rows.length || table.title.trim()) out.push({ type: "table", ...table });
  if ((s.cta ?? "").trim())
    out.push({ type: "button", label: s.cta, href: s.ctaHref ?? "" });
  return out;
}
