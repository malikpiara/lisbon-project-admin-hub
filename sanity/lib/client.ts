import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

// Read-only client for fetching published content in Server Components.
// `useCdn: true` serves cached, published content; flip to false (and pass a
// token) when you need drafts or zero-latency-after-publish reads.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
