import { cache } from "react";
import { headers as nextHeaders } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

// Single source of truth for the /admin gate. Resolves the Payload session and
// the acting user, redirecting to the CMS login when there isn't one. Used by
// every /admin page (server component) AND every server action — server actions
// compile to public POST endpoints, so each must gate independently; keeping the
// check here means there's exactly one place to get it right. Returns the user
// too, since the Local API doesn't infer it (writes must stamp createdBy/
// updatedBy explicitly).
//
// Wrapped in React.cache so the layout + page (rendered in the same request)
// share one payload.auth() session lookup instead of resolving it twice.
export const authedPayload = cache(async () => {
  // Exclude every /admin page (and server action) from build-time prerendering.
  // Otherwise `next build` prerenders these auth-gated pages, boots Payload, and
  // dies on the missing PAYLOAD_SECRET — secrets and sessions simply don't exist
  // at build time. connection() (preferred over `export const dynamic` in this
  // Next) ties the render to a real request, so getPayload() below never runs
  // during the build. This is the single choke point every /admin route funnels
  // through, so one call fixes them all.
  await connection();
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user) redirect("/login");
  return { payload, user };
});
