import { notFound } from "next/navigation";

import { ComponentDocPage } from "../_components/component-doc-page";
import { COMPONENT_DOCS, getComponentDoc } from "../_components/styleguide-docs";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return COMPONENT_DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const doc = getComponentDoc(slug);

  if (!doc) return {};

  return {
    title: `${doc.title} · Component library · Lisbon Project`,
    description: doc.description,
  };
}

export default async function StyleguideComponentPage({ params }: Props) {
  const { slug } = await params;
  const doc = getComponentDoc(slug);

  if (!doc) notFound();

  return <ComponentDocPage doc={doc} />;
}
