// Brand wordmark for the Studio navbar (which the theme renders dark green).
export function StudioLogo() {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontWeight: 700,
        fontSize: 15,
        letterSpacing: "-0.01em",
        color: "#ffffff",
      }}
    >
      <span
        style={{
          display: "inline-grid",
          placeItems: "center",
          width: 22,
          height: 22,
          borderRadius: 6,
          background: "#1F8E87",
          color: "#ffffff",
          fontSize: 11,
          fontWeight: 800,
        }}
      >
        LP
      </span>
      Lisbon Project
    </span>
  );
}
