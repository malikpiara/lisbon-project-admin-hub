// Single source of truth for the gallery's section list.
// Drives the sidebar nav; the page renders <section id> blocks with matching ids.
export const SECTIONS = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "radii", label: "Radii" },
  { id: "buttons", label: "Buttons" },
  { id: "badges", label: "Badges" },
  { id: "cards", label: "Cards" },
  { id: "form-fields", label: "Form fields" },
  { id: "select", label: "Select" },
  { id: "table", label: "Table" },
  { id: "collapsible", label: "Collapsible" },
] as const;
