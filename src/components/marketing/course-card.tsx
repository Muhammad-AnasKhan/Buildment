import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, BookOpen, Clock3, Layers3 } from "lucide-react";

type CourseCardProps = {
  course: {
    slug: string;
    title: string;
    description: string | null;
    projectGoal?: string | null;
    difficulty: string | null;
    estimatedHours: number | null;
    moduleCount: number;
    chapterCount: number;
  };
};

export function CourseCard({ course }: CourseCardProps) {
  const blurb = course.projectGoal ?? course.description;
  const difficulty = course.difficulty
    ? course.difficulty.toLowerCase().replaceAll("_", " ")
    : null;

  return (
    <Link
      href={`/login?redirectTo=${encodeURIComponent(`/courses/${course.slug}`)}`}
      aria-label={`View ${course.title} course`}
      className="group grid bg-card text-card-foreground outline-none transition-colors hover:bg-muted/20 focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
    >
      <div className="relative aspect-[16/10] min-h-52 overflow-hidden border-b border-border bg-muted md:aspect-auto md:min-h-80 md:border-r md:border-b-0">
        <Image
          src="/showcase/multi-vendor-marketplace/freshmarket-catalogue-hd.png"
          alt="FreshMarket storefront, unified checkout, and vendor management screens"
          fill
          sizes="(min-width: 1280px) 560px, (min-width: 768px) 46vw, 100vw"
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transform-none"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent dark:from-background/45"
          aria-hidden
        />
      </div>
      <div className="flex min-w-0 flex-col p-5 sm:p-7 lg:p-9">
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Featured learning path
            </span>
            <span
              className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors group-hover:border-foreground/20 group-hover:text-foreground"
              aria-hidden
            >
              <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
            </span>
          </div>
          <h3 className="mt-5 text-2xl leading-tight font-semibold tracking-[-0.03em] text-foreground sm:text-[1.75rem]">
            {course.title}
          </h3>
          {blurb ? (
            <p className="mt-3 line-clamp-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
              {blurb}
            </p>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              A guided project course with a clear path from concept to working product.
            </p>
          )}
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border py-4 text-xs text-muted-foreground sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <Layers3 className="size-3.5 shrink-0" aria-hidden />
            <dt className="sr-only">Modules</dt>
            <dd>
              {course.moduleCount} {course.moduleCount === 1 ? "module" : "modules"}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="size-3.5 shrink-0" aria-hidden />
            <dt className="sr-only">Chapters</dt>
            <dd>
              {course.chapterCount} {course.chapterCount === 1 ? "chapter" : "chapters"}
            </dd>
          </div>
          {course.estimatedHours !== null ? (
            <div className="flex items-center gap-2">
              <Clock3 className="size-3.5 shrink-0" aria-hidden />
              <dt className="sr-only">Estimated duration</dt>
              <dd>
                {course.estimatedHours} {course.estimatedHours === 1 ? "hour" : "hours"}
              </dd>
            </div>
          ) : null}
          {difficulty ? (
            <div className="col-span-2 capitalize sm:col-span-3">
              <dt className="sr-only">Difficulty</dt>
              <dd>{difficulty} level</dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          <span className="text-sm font-semibold text-foreground">Explore the course</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            See the full learning path
          </span>
        </div>
      </div>
    </Link>
  );
}
