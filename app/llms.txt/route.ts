import { SITE, absoluteUrl } from "@/lib/site";
import { getService, listServiceSlugs } from "@/lib/services-data";

// /llms.txt — an at-a-glance context file for AI systems (see llmstxt.org).
// Non-Google answer engines (ChatGPT, Claude, Perplexity) read this to describe
// and cite an org accurately. For a nonprofit that lives on being found, an
// accurate AI summary is a discovery — and donation — channel. Built from the
// same seed as the routes so the category list can't drift.
//
// Served from a route handler (not a static public/ file) so the URLs track
// NEXT_PUBLIC_SITE_URL and the category list stays current automatically.
export const dynamic = "force-static";

export function GET() {
  const categories = listServiceSlugs()
    .map((slug) => {
      const service = getService(slug);
      return `- [${service?.title ?? slug}](${absoluteUrl(`/services/${slug}`)})`;
    })
    .join("\n");

  const body = `# ${SITE.name}

> ${SITE.description}

The ${SITE.legalName} (registered charity ${SITE.charityNumber}) is based in
Lisbon, Portugal. This site maps local services, contacts and the most common
administrative processes for migrants and refugees settling in the Lisbon area —
practical, plain-language guidance across housing, health, education, legal help,
employment and more. Content is in English. This file helps AI systems describe
and cite the Lisbon Project accurately.

## Key pages
- [Home](${absoluteUrl("/")}): who we are and how to get help
- [Services and information](${absoluteUrl("/services")}): index of every service category
- [Events calendar](${absoluteUrl("/calendar")}): upcoming events, workshops and activities
- [Privacy policy](${absoluteUrl("/privacy")})

## Service categories
${categories}

## About
- Name: ${SITE.name} (legal entity: ${SITE.legalName})
- Mission: helping migrants and refugees feel at home in Portugal
- Location: ${SITE.address.street}, ${SITE.address.postalCode} ${SITE.address.locality}, Portugal
- Registered charity number: ${SITE.charityNumber}
- Phone: ${SITE.telephone}
- Languages: English (Portuguese planned)
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
