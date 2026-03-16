import { notFound } from "next/navigation";
import LessonPageClient from "@/app/lessons/[slug]/LessonPageClient";
import { getLessonBySlug, lessons } from "@/lib/lessons";

interface LessonPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return lessons.map((lesson) => ({
    slug: lesson.slug,
  }));
}

export default async function LessonPage(props: LessonPageProps) {
  const params = await props.params;
  const lesson = getLessonBySlug(params.slug);

  if (!lesson) {
    notFound();
  }

  return <LessonPageClient slug={params.slug} />;
}
