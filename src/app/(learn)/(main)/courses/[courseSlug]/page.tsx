import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/server/db";
import { requireEnrolledMentee } from "@/server/auth/guards";
import { CourseOverviewHero } from "@/components/learn/course-overview-hero";
import { CourseStatsRow } from "@/components/learn/course-stats-row";
import { CourseTechStack } from "@/components/learn/course-tech-stack";
import { CourseShowcase } from "@/components/learn/course-showcase";
import { CourseSkills } from "@/components/learn/course-skills";
import { CourseSyllabus, type SyllabusModule } from "@/components/learn/course-syllabus";
import { COURSE_SHOWCASE } from "@/lib/course-showcase";
import type { ProgressStatus } from "@/generated/prisma/client";

function pickContinueTarget(
  flatChapters: { slug: string; title: string; status: ProgressStatus }[]
) {
  const inProgress = flatChapters.find((c) => c.status === "IN_PROGRESS");
  if (inProgress) return inProgress;

  const notStarted = flatChapters.find((c) => c.status === "NOT_STARTED");
  if (notStarted) return notStarted;

  return flatChapters[0] ?? null;
}

function pickDefaultOpenModule(modules: SyllabusModule[]) {
  const withProgress = modules.find((mod) =>
    mod.chapters.some((c) => c.status === "IN_PROGRESS" || c.status === "NOT_STARTED")
  );
  return withProgress?.id ?? modules[0]?.id ?? null;
}

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      projectGoal: true,
      coverUrl: true,
      difficulty: true,
      estimatedHours: true,
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          title: true,
          chapters: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              slug: true,
              title: true,
              _count: { select: { blocks: true } },
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

  const { enrollment } = await requireEnrolledMentee(course.id);
  const progress = await prisma.chapterProgress.findMany({
    where: { enrollmentId: enrollment.id },
    select: { chapterId: true, status: true },
  });
  const progressByChapter = new Map(progress.map((p) => [p.chapterId, p.status]));

  const modules: SyllabusModule[] = course.modules.map((mod) => {
    const chapters = mod.chapters.map((chapter) => ({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      status: progressByChapter.get(chapter.id) ?? ("NOT_STARTED" as const),
      blockCount: chapter._count.blocks,
    }));
    return {
      id: mod.id,
      order: mod.order,
      title: mod.title,
      chapters,
      completedCount: chapters.filter((c) => c.status === "COMPLETED").length,
    };
  });

  const flatChapters = modules.flatMap((mod) => mod.chapters);
  const continueTarget = pickContinueTarget(flatChapters);
  const defaultOpenModuleId = pickDefaultOpenModule(modules);
  const checkpointCount = flatChapters.reduce((sum, c) => sum + c.blockCount, 0);

  const continueLabel =
    enrollment.percentComplete === 0
      ? "Start learning"
      : enrollment.percentComplete >= 100
        ? "Review course"
        : "Continue learning";

  const showcaseContent = COURSE_SHOWCASE[course.slug];

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-950"
      >
        <ArrowLeft className="size-4" />
        Back to dashboard
      </Link>

      <CourseOverviewHero
        difficulty={course.difficulty}
        title={course.title}
        description={course.description}
        projectGoal={course.projectGoal}
        coverUrl={course.coverUrl}
        percentComplete={enrollment.percentComplete}
        continueHref={
          continueTarget ? `/courses/${course.slug}/${continueTarget.slug}` : null
        }
        continueLabel={continueLabel}
        moduleCount={modules.length}
        chapterCount={flatChapters.length}
        estimatedHours={course.estimatedHours}
      />

      <CourseStatsRow
        moduleCount={modules.length}
        chapterCount={flatChapters.length}
        estimatedHours={course.estimatedHours}
        checkpointCount={checkpointCount}
      />

      {showcaseContent ? (
        <CourseTechStack techStack={showcaseContent.techStack} />
      ) : null}

      {showcaseContent ? <CourseShowcase tabs={showcaseContent.showcase} /> : null}

      {showcaseContent ? <CourseSkills skills={showcaseContent.skills} /> : null}

      <CourseSyllabus
        courseSlug={course.slug}
        modules={modules}
        defaultOpenModuleId={defaultOpenModuleId}
      />

      <footer className="flex items-center justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-400">
        <span>buildment</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
          Published
        </span>
      </footer>
    </div>
  );
}
