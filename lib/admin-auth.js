import { cache } from "react";
import { headers as nextHeaders } from "next/headers";
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
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await nextHeaders() });
  if (!user) redirect("/cms-admin/login");
  return { payload, user };
});
