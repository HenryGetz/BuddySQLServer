import { notFound } from "next/navigation";
import GlossaryTermPageClient from "@/app/glossary/[slug]/GlossaryTermPageClient";
import { getGlossaryTermBySlug, glossaryTerms } from "@/lib/glossaryData";

interface GlossaryTermPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return glossaryTerms.map((term) => ({
    slug: term.slug,
  }));
}

export default async function GlossaryTermPage(props: GlossaryTermPageProps) {
  const params = await props.params;
  const term = getGlossaryTermBySlug(params.slug);

  if (!term) {
    notFound();
  }

  return <GlossaryTermPageClient slug={params.slug} />;
}
