import { JetBrains_Mono, Quicksand } from "next/font/google";
import "../globals.css";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { SITE, SITE_URL } from "@/lib/site";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Heading display font — Quicksand, per the DS Settings token (the DS's single family).
const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

// Shared by the public site, /admin and /login. The default title + description
// are public-facing (the admin/login routes set their own titles and opt out of
// indexing). metadataBase makes every relative canonical / OG url resolve to the
// real host. `%s` template appends the brand to each page's own title.
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — services and support for migrants and refugees in Lisbon`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_GB",
    title: `${SITE.name} — services and support for migrants and refugees in Lisbon`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${jetBrainsMono.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
