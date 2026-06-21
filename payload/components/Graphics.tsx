"use client";

// Brand graphics for the Payload admin (login screen + nav), registered via
// app/(payload)/cms-admin/importMap.js and referenced in payload.config.ts.

export function Icon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" role="img" aria-label="Lisbon Project">
      <rect width="22" height="22" rx="6" fill="#0D635D" />
      <text
        x="11"
        y="15"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fill="#ffffff"
        fontFamily="system-ui, sans-serif"
      >
        LP
      </text>
    </svg>
  );
}

export function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <svg width="40" height="40" viewBox="0 0 40 40" role="img" aria-label="Lisbon Project">
        <rect width="40" height="40" rx="11" fill="#0D635D" />
        <text
          x="20"
          y="27"
          textAnchor="middle"
          fontSize="18"
          fontWeight="800"
          fill="#ffffff"
          fontFamily="system-ui, sans-serif"
        >
          LP
        </text>
      </svg>
      <span style={{ fontSize: 22, fontWeight: 700, color: "#0A2422", letterSpacing: "-0.01em" }}>
        Lisbon Project
      </span>
    </div>
  );
}
