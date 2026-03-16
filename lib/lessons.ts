import { lessons as generatedLessons } from "./generatedLessons";
import { sampleDatabaseInit } from "./database";

export const lessons = generatedLessons;

export function getLessonBySlug(slug: string) {
  return lessons.find((lesson) => lesson.slug === slug);
}

export function getNextLesson(currentLessonId: string) {
  const currentIndex = lessons.findIndex(
    (lesson) => lesson.id === currentLessonId,
  );

  if (currentIndex === -1 || currentIndex === lessons.length - 1) {
    return undefined;
  }

  return lessons[currentIndex + 1];
}

export function getPreviousLesson(currentLessonId: string) {
  const currentIndex = lessons.findIndex(
    (lesson) => lesson.id === currentLessonId,
  );

  if (currentIndex <= 0) {
    return undefined;
  }

  return lessons[currentIndex - 1];
}

export const lessonCategories = [
  { name: "basics", label: "SQL Basics" },
  { name: "intermediate", label: "Intermediate SQL" },
];

export function initializeDatabase() {
  return sampleDatabaseInit;
}
