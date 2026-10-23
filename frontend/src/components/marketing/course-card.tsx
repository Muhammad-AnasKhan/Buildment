import Link from "next/link";
import { ArrowRight, BookOpen, Layers3 } from "lucide-react";
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

type CourseCardProps = { course: CourseCardData };

const FALLBACK_BLURB =
  "A guided project course with a clear path from concept to working product.";

function courseHref(slug: string) {
  return `/login?redirectTo=${encodeURIComponent(`/courses/${slug}`)}`;
}

function DifficultyPill({ difficulty }: { difficulty: string }) {
  return (
    <span className="rounded-full bg-card px-2.5 py-0.5 text-xs font-semibold capitalize text-foreground shadow-sm">
      {difficulty}
    </span>
  );
}

/** Carousel card: cover with a difficulty pill, title, blurb, stats row, full-width button. */
export function CourseCard({ course }: CourseCardProps) {
  const blurb = course.projectGoal ?? course.description;
  return (
    <Link
      href={courseHref(course.slug)}
      aria-label={`View ${course.title} course`}
      className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-card text-card-foreground outline-none transition-[transform,box-shadow] duration-[250ms] hover:-translate-y-[5px] hover:shadow-xl hover:shadow-foreground/10 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50 motion-reduce:transform-none motion-reduce:transition-none"
    >
      <div className="relative">
        <CourseCover
          coverUrl={course.coverUrl}
          title={course.title}
          aspect="video"
          className="aspect-auto h-[150px] min-h-0 rounded-none"
        />
        {course.difficulty ? (
          <span className="absolute left-3 top-3">
            <DifficultyPill difficulty={course.difficulty} />
          </span>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 p-[18px]">
        <h3 className="text-[19px] font-semibold leading-snug tracking-tight text-foreground">
          {course.title}
        </h3>
        <p className="line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">
          {blurb ?? FALLBACK_BLURB}
        </p>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Layers3 className="size-3.5 shrink-0" aria-hidden />
            <b className="font-semibold text-foreground">
              {course.moduleCount}
            </b>{" "}
            {course.moduleCount === 1 ? "module" : "modules"}
          </span>
          {course.estimatedHours !== null ? (
            <span>
              <b className="font-semibold text-foreground">
                {course.estimatedHours}h
              </b>{" "}
              total
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <BookOpen className="size-3.5 shrink-0" aria-hidden />
              <b className="font-semibold text-foreground">
                {course.chapterCount}
              </b>{" "}
              {course.chapterCount === 1 ? "chapter" : "chapters"}
            </span>
          )}
        </div>
        <span className="block rounded-xl bg-foreground px-4 py-2.5 text-center text-sm font-semibold text-background">
          View course
        </span>
      </div>
    </Link>
  );
}

/** Wide two-column card (cover left, details right), used when only one course is listed. */
export function FeaturedCourseCard({ course }: CourseCardProps) {
  const blurb = course.projectGoal ?? course.description;
  return (
    <Link
      href={courseHref(course.slug)}
      aria-label={`View ${course.title} course`}
      className="group grid overflow-hidden rounded-3xl border border-border bg-card text-card-foreground outline-none transition-[transform,box-shadow] duration-[250ms] hover:-translate-y-[3px] hover:shadow-xl hover:shadow-foreground/10 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50 motion-reduce:transform-none motion-reduce:transition-none md:grid-cols-[1fr_1.1fr]"
    >
      <div className="relative">
        <CourseCover
          coverUrl={course.coverUrl}
          title={course.title}
          aspect="video"
          className="aspect-auto min-h-[14rem] rounded-none md:h-full"
        />
        {course.difficulty ? (
          <span className="absolute left-3 top-3">
            <DifficultyPill difficulty={course.difficulty} />
          </span>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col justify-center gap-3.5 p-6 sm:p-8 lg:p-10">
        <h3 className="text-2xl font-semibold leading-tight tracking-tight sm:text-[1.75rem]">
          {course.title}
        </h3>
        <p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
          {blurb ?? FALLBACK_BLURB}
        </p>
        <div className="flex flex-wrap gap-x-[18px] gap-y-2 text-sm text-muted-foreground">
          <span>
            <b className="font-semibold text-foreground">
              {course.moduleCount}
            </b>{" "}
            {course.moduleCount === 1 ? "module" : "modules"}
          </span>
          <span>
            <b className="font-semibold text-foreground">
              {course.chapterCount}
            </b>{" "}
            {course.chapterCount === 1 ? "chapter" : "chapters"}
          </span>
          {course.estimatedHours !== null ? (
            <span>
              <b className="font-semibold text-foreground">
                {course.estimatedHours}h
              </b>{" "}
              total
            </span>
          ) : null}
        </div>
        <span className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          View course
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}
