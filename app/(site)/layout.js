import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { ZapierChatbot } from "@/components/site/zapier-chatbot";

export default function SiteLayout({ children }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <ZapierChatbot />
    </>
  );
}
