import { withPayload } from "@payloadcms/next/withPayload";

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
};

// withPayload injects the @payload-config alias and Payload's build tweaks.
export default withPayload(nextConfig);
