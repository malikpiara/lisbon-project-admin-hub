import { ViewTransition } from "react";

import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ZapierChatbot } from "@/components/site/zapier-chatbot";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, webSiteSchema } from "@/lib/site";

export default function SiteLayout({ children }) {
  return (
    <>
      {/* Site-wide structured data: the org (anchor entity for search + AI) and
          the website, rendered on every public page's initial HTML. */}
      <JsonLd data={[organizationSchema(), webSiteSchema()]} />
      <SiteHeader />
      {/* Cross-fade the page content on route change — the same native
          <ViewTransition> boundary the admin uses (admin/layout.js). The header,
          footer and chatbot sit outside it, so only the content swaps. Timing +
          reduced-motion live in globals.css (::view-transition-*). */}
      <main className="flex-1">
        <ViewTransition>{children}</ViewTransition>
      </main>
      <SiteFooter />
      <ZapierChatbot />
    </>
  );
}
