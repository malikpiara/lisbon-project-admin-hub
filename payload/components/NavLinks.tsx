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
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: "var(--theme-elevation-500)",
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
            padding: "6px 0",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--theme-elevation-800)",
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
