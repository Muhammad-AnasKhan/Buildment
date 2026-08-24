import Link from "next/link";

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
  const meta = [
    course.difficulty,
    `${course.chapterCount} lessons`,
    course.estimatedHours ? `${course.estimatedHours}h` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-colors hover:border-neutral-300"
    >
      <div className="aspect-[16/8] w-full bg-neutral-100">
        {course.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.coverUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-semibold leading-snug text-neutral-900">{course.title}</h3>
        {course.description ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-neutral-500">
            {course.description}
          </p>
        ) : null}
        <p className="mt-auto pt-4 text-xs text-neutral-400">{meta}</p>
      </div>
    </Link>
  );
}
