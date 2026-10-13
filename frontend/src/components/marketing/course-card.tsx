import Link from "next/link";
import { ArrowUpRight, BookOpen, Layers3 } from "lucide-react";
import { CourseCover } from "@/components/learn/course-cover";

type CourseCardProps = {
  course: {
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
};

export function CourseCard({ course }: CourseCardProps) {
  const blurb = course.projectGoal ?? course.description;
  return (
    <Link
      href={`/login?redirectTo=${encodeURIComponent(`/courses/${course.slug}`)}`}
      aria-label={`View ${course.title} course`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm outline-none transition-[box-shadow,background-color] hover:bg-muted/15 hover:shadow-md focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50"
    >
      <div className="relative">
        <CourseCover
          coverUrl={course.coverUrl}
          title={course.title}
          aspect="video"
          className="rounded-none"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent dark:from-background/50"
          aria-hidden
        />
        <span
          className="absolute top-3 right-3 grid size-8 place-items-center rounded-full border border-border/80 bg-background/90 text-muted-foreground shadow-sm backdrop-blur-sm transition-colors group-hover:border-foreground/20 group-hover:text-foreground"
          aria-hidden
        >
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {course.difficulty ? (
            <span className="font-medium uppercase tracking-wide">{course.difficulty}</span>
          ) : null}
          {course.estimatedHours !== null ? <span>~{course.estimatedHours}h</span> : null}
        </div>
        <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-foreground">
          {course.title}
        </h3>
        {blurb ? (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">
            {blurb}
          </p>
        ) : (
          <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
            A guided project course with a clear path from concept to working product.
          </p>
        )}
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <Layers3 className="size-3.5 shrink-0" aria-hidden />
            {course.moduleCount} {course.moduleCount === 1 ? "module" : "modules"}
          </li>
          <li className="flex items-center gap-1.5">
            <BookOpen className="size-3.5 shrink-0" aria-hidden />
            {course.chapterCount} {course.chapterCount === 1 ? "chapter" : "chapters"}
          </li>
        </ul>
        <p className="mt-4 text-sm font-medium text-foreground">View course</p>
      </div>
    </Link>
  );
}
