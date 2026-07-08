import type { Metadata } from "next";
import { notFound } from "next/navigation";

import config from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";

import { importMap } from "../importMap.js";

type Args = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
};

// The native Payload admin is a maintenance-only escape hatch. The team uses the
// custom /admin instead, so this route is blocked on the live production
// deployment. It stays available locally and on preview deploys (so it can still
// be used for debugging/migrations), and can be re-enabled in production
// temporarily by setting ALLOW_CMS_ADMIN=1 and redeploying. Gating on VERCEL_ENV
// (not NODE_ENV) keeps a local `next start` production build usable.
const blockedInProd =
  process.env.VERCEL_ENV === "production" &&
  process.env.ALLOW_CMS_ADMIN !== "1";

export const generateMetadata = ({
  params,
  searchParams,
}: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

const Page = ({ params, searchParams }: Args) => {
  if (blockedInProd) notFound();
  return RootPage({ config, params, searchParams, importMap });
};

export default Page;
