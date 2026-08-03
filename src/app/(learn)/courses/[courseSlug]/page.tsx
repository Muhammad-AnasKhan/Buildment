import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { prisma } from "@/server/db";
import { requireEnrolledMentee } from "@/server/auth/guards";
import { cn } from "@/lib/utils";

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: { chapters: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) notFound();

  const { enrollment } = await requireEnrolledMentee(course.id);
  const progress = await prisma.chapterProgress.findMany({
    where: { enrollmentId: enrollment.id },
  });
  const progressByChapter = new Map(progress.map((p) => [p.chapterId, p]));

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {course.difficulty ?? "Course"}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{course.title}</h1>
      {course.description ? (
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {course.description}
        </p>
      ) : null}

      <div className="mt-6 flex items-center gap-3">
        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${enrollment.percentComplete}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">{enrollment.percentComplete}% complete</span>
      </div>

      <div className="mt-10 space-y-8">
        {course.modules.map((mod) => (
          <div key={mod.id}>
            <h2 className="text-sm font-semibold text-foreground">{mod.title}</h2>
            <ul className="mt-2 divide-y divide-border rounded-md border border-border">
              {mod.chapters.map((chapter) => {
                const chapterProgress = progressByChapter.get(chapter.id);
                const status = chapterProgress?.status ?? "NOT_STARTED";
                return (
                  <li key={chapter.id}>
                    <Link
                      href={`/courses/${course.slug}/${chapter.slug}`}
                      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent"
                    >
                      {status === "COMPLETED" ? (
                        <CheckCircle2 className="size-4 shrink-0 text-primary" />
                      ) : status === "IN_PROGRESS" ? (
                        <CircleDot className="size-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <Circle className="size-4 shrink-0 text-muted-foreground/50" />
                      )}
                      <span
                        className={cn(
                          "flex-1",
                          status === "COMPLETED" && "text-muted-foreground"
                        )}
                      >
                        {chapter.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
