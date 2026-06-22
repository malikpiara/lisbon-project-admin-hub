import type { ReactNode } from "react";
import { Quicksand } from "next/font/google";

// Brand font (matches the public site), so the Studio uses Quicksand too.
const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Sanity Studio · Lisbon Project",
  // The editor must never be indexed.
  robots: { index: false, follow: false },
};

// Dedicated root layout. The Studio is a full-viewport single-page app, so we
// deliberately keep it OUT of the (frontend) root layout — no Tailwind globals,
// no app fonts, no AdminProvider — to avoid any style bleed into the editor.
// (Next 16 allows multiple root layouts as long as there is no top-level
// app/layout.js; see the (frontend) and (payload) groups.)
export default function StudioRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={quicksand.className}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
