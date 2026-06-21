import type { StructureResolver } from "sanity/structure";

// Mirrors the mock admin's information architecture
// (Quick Access · Services & Information), instead of a flat type list.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Quick Access")
        .child(
          S.documentTypeList("quickAccess").title("Quick access cards"),
        ),
      S.divider(),
      S.listItem()
        .title("Services & Information")
        .child(S.documentTypeList("service").title("Services")),
      S.listItem()
        .title("Topics")
        .child(S.documentTypeList("topic").title("Topics")),
    ]);
