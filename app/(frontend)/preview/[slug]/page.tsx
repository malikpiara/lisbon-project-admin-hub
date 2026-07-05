import { notFound } from "next/navigation";

import {
  COMPONENT_DOCS,
  getComponentDoc,
} from "../../components/_components/styleguide-docs";

// Bare rendering surface for the /components system-component previews.
// Loaded inside an iframe so the component gets a real viewport: Tailwind
// breakpoints and the DS type scale respond to the frame's width instead of
// mis-rendering desktop layouts inside a narrow doc column.
type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return COMPONENT_DOCS.filter((doc) => doc.fullWidthPreview).map((doc) => ({
    slug: doc.slug,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const doc = getComponentDoc(slug);
  if (!doc) return {};
  return {
    title: `${doc.title} · Preview`,
    robots: { index: false },
  };
}

export default async function ComponentPreviewPage({ params }: Props) {
  const { slug } = await params;
  const doc = getComponentDoc(slug);
  if (!doc?.fullWidthPreview) notFound();
  // py-10: most system sections are designed to flow after other page content
  // and carry no top padding of their own — without this they sit flush
  // against the preview frame's edge.
  return <div className="min-h-screen bg-bg-page py-10">{doc.preview}</div>;
}
