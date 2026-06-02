import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AdminProvider } from "@/lib/admin-store";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
      className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AdminProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AdminProvider>
        {/* Zapier chatbot — fixed popup affordance, site-wide */}
        <script
          async
          type="module"
          src="https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js"
        />
        <zapier-interfaces-chatbot-embed
          is-popup="true"
          chatbot-id="cmeqzl2cf001e10atrngwijr8"
        ></zapier-interfaces-chatbot-embed>
      </body>
    </html>
  );
}
