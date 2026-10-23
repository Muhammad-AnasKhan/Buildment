import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CourseCover } from "@/components/learn/course-cover";

export type CourseCardData = {
  slug: string;
  title: string;
  description: string | null;
  projectGoal?: string | null;
  coverUrl?: string | null;
  difficulty: string | null;
  estimatedHours: number | null;
  moduleCount: number;
  chapterCount: number;
};

// Catalog titles can contain typographic dashes. Keep marketing copy consistent.
export function plainDashes(text: string) {
  return text.replace(/[\u2013\u2014]/g, ":");
}

export function courseHref(slug: string) {
  return `/login?redirectTo=${encodeURIComponent(`/courses/${slug}`)}`;
}

export function CourseCard({ course, coverIndex = 0 }: { course: CourseCardData; coverIndex?: number }) {
  return (
    <article className="flex h-full min-w-0 flex-col border-t border-border pt-4">
      <div className="mb-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="font-mono">{String(coverIndex + 1).padStart(2, "0")}</span>
        <span>{course.difficulty}{course.estimatedHours !== null ? ` / ${course.estimatedHours} hours` : ""}</span>
      </div>
      <CourseCover coverUrl={course.coverUrl} title={plainDashes(course.title)} paletteIndex={coverIndex}
        className="mb-5 h-28 min-h-0 aspect-auto" />
      <h3 className="text-xl font-medium leading-snug tracking-tight">
        <Link href={courseHref(course.slug)} className="underline-offset-4 hover:underline">
          {plainDashes(course.title)}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-foreground">
        {plainDashes(course.projectGoal ?? course.description ?? "Read the course chapters and put what you learn into practice.")}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span>{course.chapterCount} {course.chapterCount === 1 ? "chapter" : "chapters"}</span>
        <Link href={courseHref(course.slug)} aria-label={`Sign in to view ${plainDashes(course.title)}`}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
          View course <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
