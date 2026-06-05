import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export default function SiteLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {/* Zapier chatbot — fixed popup affordance, public site only */}
      <script
        async
        type="module"
        src="https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js"
      />
      <zapier-interfaces-chatbot-embed
        is-popup="true"
        chatbot-id="cmeqzl2cf001e10atrngwijr8"
      ></zapier-interfaces-chatbot-embed>
    </>
  );
}
