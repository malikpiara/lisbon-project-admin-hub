import type { ServerFunctionClient } from "payload";
import type { ReactNode } from "react";

import { Quicksand } from "next/font/google";
import config from "@payload-config";
import "@payloadcms/next/css";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";

import { importMap } from "./cms-admin/importMap.js";
import "./custom.css";

// Brand font (matches the public site), applied to the admin subtree.
const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Second/third root layout (Next 16 allows several when there is no top-level
// app/layout.js). Payload's RootLayout renders its own <html>/<body>, so this
// group is fully isolated from the (frontend) app shell.
const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

const Layout = ({ children }: { children: ReactNode }) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={serverFunction}
  >
    <div className={quicksand.className} style={{ display: "contents" }}>
      {children}
    </div>
  </RootLayout>
);

export default Layout;
