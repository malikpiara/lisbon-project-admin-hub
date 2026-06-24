"use client";

// Header at the top of the Payload admin nav, mirroring the DS team sidebar's
// header ("Admin Hub" + subtitle). Rendered via admin.components.beforeNavLinks.
// Quicksand is already applied to the admin subtree (see layout.tsx).
export function NavHeader() {
  return (
    <div style={{ padding: "2px 14px 14px" }}>
      <p
        style={{
          margin: 0,
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: "#0a2422", // brand-900 / brand-dark
        }}
      >
        Admin Hub
      </p>
      <p
        style={{
          margin: "2px 0 0",
          fontSize: 11,
          fontWeight: 500,
          color: "#999999", // neutral-500 / muted
        }}
      >
        Content editor
      </p>
    </div>
  );
}
