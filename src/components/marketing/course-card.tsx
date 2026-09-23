import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock3 } from "lucide-react";

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
      className="group grid bg-card text-card-foreground lg:grid-cols-[0.95fr_1.05fr]"
    >
      <div className="relative min-h-72 overflow-hidden border-b border-border bg-muted lg:border-b-0 lg:border-r">
        <Image
          src="/showcase/multi-vendor-marketplace/freshmarket-catalogue-hd.png"
          alt="FreshMarket storefront, unified checkout, and vendor management screens"
          fill
          sizes="(min-width: 1024px) 42vw, 100vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent" />
      </div>
      <div className="flex min-w-0 flex-col justify-between p-6 sm:p-8 lg:p-10">
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Featured course</span>
            <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
          </div>
          <h3 className="mt-7 text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">{course.title}</h3>
        {blurb ? (
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">{blurb}</p>
        ) : null}
          <p className="mt-6 text-xs font-medium text-muted-foreground">{facts.join("  ·  ")}</p>
        </div>
        <div className="mt-10 flex items-center justify-between border-t border-border pt-5">
          <span className="text-sm font-semibold text-foreground">View the learning path</span>
          {course.estimatedHours ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="size-3.5" /> {course.estimatedHours} hours</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
