import { NextStudio } from "next-sanity/studio";

import config from "@/sanity.config";

// The Studio is a heavy client bundle; render a static shell and let it boot
// on the client. Real data/auth happen browser-side against your Sanity project.
export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
