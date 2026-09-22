import Link from "next/link";

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
  const facts = [
    course.difficulty,
    `${course.moduleCount} modules`,
    `${course.chapterCount} chapters`,
  ].filter(Boolean);

  return (
    <Link
      href={`/login?redirectTo=${encodeURIComponent(`/courses/${course.slug}`)}`}
      className="group grid gap-6 bg-card p-6 text-card-foreground transition-colors hover:bg-muted/40 sm:grid-cols-[1fr_auto] sm:items-end sm:p-8"
    >
      <div className="min-w-0">
        <h3 className="text-xl font-medium tracking-tight text-foreground">{course.title}</h3>
        {blurb ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{blurb}</p>
        ) : null}
        <p className="mt-5 text-sm text-muted-foreground">{facts.join("  ·  ")}</p>
      </div>
      {course.estimatedHours ? (
        <div className="sm:text-right">
          <p className="font-mono text-3xl tabular-nums tracking-tight text-foreground">
            {course.estimatedHours}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">hours</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground group-hover:text-foreground">Open</p>
      )}
    </Link>
  );
}
