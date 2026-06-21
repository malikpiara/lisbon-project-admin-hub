import { JetBrains_Mono, Quicksand } from "next/font/google";
import "../globals.css";
import { AdminProvider } from "@/lib/admin-store";

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

// Heading display font — Quicksand, per the DS Settings token (the DS's single family).
const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata = {
  title: "Lisbon Project · Admin Hub",
  description:
    "Information platform summarizing the most common administrative processes, sharing tips and mapping external services.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${jetBrainsMono.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AdminProvider>{children}</AdminProvider>
      </body>
    </html>
  );
}
