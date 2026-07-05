import { ImageResponse } from "next/og";

import { SITE } from "@/lib/site";

// Default social-share card for every public page (home, services, calendar,
// privacy). Next wires this file up as og:image + twitter:image automatically.
// Text-only on a brand field — ImageResponse only supports flexbox + a subset of
// CSS, and keeping it font-import-free makes it robust at build time. A route
// deeper in the tree can override this with its own opengraph-image later.
export const alt = `${SITE.name} — services for migrants and refugees in Lisbon`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #0A2422 0%, #0A4D48 100%)",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "9999px",
              background: "#6ADCD5",
            }}
          />
          <div style={{ fontSize: "32px", color: "#B3EFEB", fontWeight: 700 }}>
            {SITE.legalName}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ fontSize: "76px", fontWeight: 800, lineHeight: 1.05 }}>
            {SITE.name}
          </div>
          <div style={{ fontSize: "36px", color: "#D9F7F5", lineHeight: 1.3 }}>
            Services and support for migrants and refugees in Lisbon
          </div>
        </div>

        <div style={{ fontSize: "26px", color: "#6ADCD5" }}>
          lisbon-project · migrant &amp; refugee integration
        </div>
      </div>
    ),
    { ...size }
  );
}
