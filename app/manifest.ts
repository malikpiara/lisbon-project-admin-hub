import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

// Web app manifest — lets the site be installed / added to a home screen and
// gives Android/Chrome a name, colours and icon. Uses the existing brand mark
// (SVG scales to any size); swap in maskable PNGs if a richer install prompt is
// wanted later.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "Lisbon Project",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1F8E87",
    lang: SITE.locale,
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
    ],
  };
}
