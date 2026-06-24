"use client";

import Link from "next/link";

// Reverse links from the Payload admin back into the DS team workspace, so the
// two surfaces are navigable both ways (the admin can't share the DS sidebar —
// it's a separate root layout that doesn't load globals.css). Rendered after
// Payload's own nav links via admin.components.afterNavLinks, and themed with
// Payload's CSS variables so it sits inside the (brand-green) admin nav.
const LINKS = [
  { href: "/insights", label: "Insights" },
  { href: "/admin", label: "Admin Hub" },
];

export function NavLinks() {
  return (
    <nav
      aria-label="Workspace"
      style={{
        marginTop: 16,
        paddingTop: 12,
        borderTop: "1px solid var(--theme-elevation-100)",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <span
        style={{
          marginBottom: 4,
          paddingLeft: 12, // align with the CONTENT/ADMIN group labels (20px)
          fontSize: 13, // DS text-ds-xxs, matching the other group labels
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "#666666", // muted-foreground
        }}
      >
        Workspace
      </span>
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 0 6px 12px", // align text with the nav items (20px)
            fontSize: 15, // DS text-ds-xs, matching the nav items
            fontWeight: 700,
            color: "#0d635d", // brand-link, matching the nav items
            textDecoration: "none",
          }}
        >
          {l.label}
          <span aria-hidden style={{ fontSize: 12, opacity: 0.6 }}>
            ↗
          </span>
        </Link>
      ))}
    </nav>
  );
}
