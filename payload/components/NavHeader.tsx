"use client";

// Header at the top of the Payload admin nav, mirroring the DS team sidebar's
// header ("Admin Hub" + subtitle). Rendered via admin.components.beforeNavLinks.
// Quicksand is already applied to the admin subtree (see layout.tsx).
export function NavHeader() {
  return (
    <div style={{ padding: "2px 12px 14px" }}>
      <p
        style={{
          margin: 0,
          fontSize: 16, // DS text-ds-s
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: "#0a4d48", // brand-dark (brand-700)
        }}
      >
        Admin Hub
      </p>
      <p
        style={{
          margin: "4px 0 0",
          fontSize: 13, // DS text-ds-xxs
          fontWeight: 500,
          color: "#666666", // muted-foreground (text-tertiary)
        }}
      >
        Content editor
      </p>
    </div>
  );
}
