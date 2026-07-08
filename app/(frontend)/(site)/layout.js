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
          reduced-motion live in globals.css (::view-transition-*).

          The inner <div> is load-bearing: public pages render a *fragment* of
          several sibling <section>s, and <ViewTransition> names each direct child
          separately. Across routes those per-section names get matched to
          different-position sections on the next page, so each one animates the Y
          delta — the content visibly slides. Wrapping in one element gives the
          whole page a single name, so it cross-fades as one unit (like the admin
          and /components pages, which already render a single root element). */}
      <main className="flex-1">
        <ViewTransition>
          <div>{children}</div>
        </ViewTransition>
      </main>
      <SiteFooter />
      <ZapierChatbot />
    </>
  );
}
