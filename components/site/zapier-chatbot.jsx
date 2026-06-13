"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";

function subscribe() {
  return () => {};
}

export function ZapierChatbot() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  if (!mounted) return null;

  return (
    <>
      <Script
        id="zapier-interfaces"
        type="module"
        src="https://interfaces.zapier.com/assets/web-components/zapier-interfaces/zapier-interfaces.esm.js"
        strategy="afterInteractive"
      />
      <zapier-interfaces-chatbot-embed
        is-popup="true"
        chatbot-id="cmeqzl2cf001e10atrngwijr8"
      ></zapier-interfaces-chatbot-embed>
    </>
  );
}
