import Link from "next/link";
import { BookOpen, Clock, Layers } from "lucide-react";

type CourseCardProps = {
  course: {
    slug: string;
    title: string;
    description: string | null;
    coverUrl: string | null;
    difficulty: string | null;
    estimatedHours: number | null;
    moduleCount: number;
    chapterCount: number;
  };
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
    >
      {/* Cover area */}
      <div className="relative aspect-[16/9] w-full bg-[radial-gradient(circle_at_50%_40%,rgba(79,70,229,0.12),transparent_60%)] bg-neutral-100">
        {course.coverUrl ? (
          <img
            src={course.coverUrl}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : null}
        {course.difficulty ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 shadow-sm backdrop-blur-sm">
            {course.difficulty}
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 className="font-semibold text-neutral-950 group-hover:text-indigo-700">{course.title}</h3>
          {course.description ? (
            <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-neutral-600">
              {course.description}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600">
            <Layers className="size-3 text-indigo-500" />
            {course.moduleCount} modules
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600">
            <BookOpen className="size-3 text-indigo-500" />
            {course.chapterCount} lessons
          </span>
          {course.estimatedHours ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600">
              <Clock className="size-3 text-indigo-500" />
              {course.estimatedHours}h
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3 border-t border-neutral-200 pt-3">
          <div className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-neutral-200">
            <span className="font-mono text-xs font-bold tabular-nums text-neutral-400">0%</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">Your progress</p>
            <p className="text-sm font-medium text-neutral-800">Not started</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
