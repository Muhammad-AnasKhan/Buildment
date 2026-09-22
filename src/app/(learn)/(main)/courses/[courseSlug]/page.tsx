import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { prisma } from "@/server/db";
import { ForbiddenError, requireEnrolledMentee } from "@/server/auth/guards";
import { CourseOverviewHero } from "@/components/learn/course-overview-hero";
import { CourseSyllabus, type SyllabusModule } from "@/components/learn/course-syllabus";
import { decorateSyllabus } from "@/server/progress/syllabus";
import { isCompletableBlock } from "@/server/progress/rules";
import type { ProgressStatus } from "@/generated/prisma/client";

function pickContinueTarget(
  flatChapters: { slug: string; title: string; status: ProgressStatus; locked?: boolean }[]
) {
  const inProgress = flatChapters.find((c) => !c.locked && c.status === "IN_PROGRESS");
  if (inProgress) return inProgress;

  const notStarted = flatChapters.find((c) => !c.locked && c.status === "NOT_STARTED");
  if (notStarted) return notStarted;

  const unlocked = flatChapters.find((c) => !c.locked);
  return unlocked ?? flatChapters[0] ?? null;
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
      sequential: true,
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
              order: true,
              blocks: {
                where: { archivedAt: null },
                select: { type: true, required: true, archivedAt: true },
              },
            },
          },
        },
      },
    },
  });
  if (!course) notFound();

  // The guard stays the single authorization decision point; the page just
  // renders a clean denial instead of crashing on ForbiddenError (e.g. a
  // mentor opening a learner link, or an unassigned mentee following a URL).
  let enrolled;
  try {
    enrolled = await requireEnrolledMentee(course.id);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return (
        <div className="mx-auto max-w-4xl px-6 py-10">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
          <div className="mt-16 flex flex-col items-center text-center">
            <Lock className="size-8 text-neutral-300" aria-hidden />
            <p className="mt-3 text-sm font-medium text-neutral-700">
              You don&apos;t have access to this course
            </p>
            <p className="mt-1 max-w-sm text-sm text-neutral-400">
              Ask your mentor to assign it to you, or use the invite link they sent.
            </p>
          </div>
        </div>
      );
    }
    throw error;
  }

  const { enrollment } = enrolled;
  const progress = await prisma.chapterProgress.findMany({
    where: { enrollmentId: enrollment.id },
    select: { chapterId: true, status: true, blocksCompleted: true, blocksTotal: true },
  });
  const progressByChapter = new Map(progress.map((p) => [p.chapterId, p.status]));
  const progressCountByChapter = new Map(
    progress.map((p) => [p.chapterId, { completed: p.blocksCompleted, total: p.blocksTotal }])
  );

  const modules: SyllabusModule[] = decorateSyllabus({
    sequential: course.sequential,
    progressByChapter,
    modules: course.modules.map((mod) => ({
      id: mod.id,
      order: mod.order,
      title: mod.title,
      chapters: mod.chapters.map((chapter) => {
        const counts = progressCountByChapter.get(chapter.id);
        const blockCount = chapter.blocks.filter((block) => isCompletableBlock(block)).length;
        return {
          id: chapter.id,
          slug: chapter.slug,
          title: chapter.title,
          order: chapter.order,
          blockCount,
          blocksCompleted: counts?.completed ?? 0,
        };
      }),
    })),
  });

  const flatChapters = modules.flatMap((mod) => mod.chapters);
  const continueTarget = pickContinueTarget(flatChapters);
  const defaultOpenModuleId = pickDefaultOpenModule(modules);

  const continueLabel =
    enrollment.percentComplete === 0
      ? "Start learning"
      : enrollment.percentComplete >= 100
        ? "Review course"
        : "Continue learning";

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 transition-colors hover:text-neutral-900"
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

      <CourseSyllabus
        courseSlug={course.slug}
        modules={modules}
        defaultOpenModuleId={defaultOpenModuleId}
      />
    </div>
  );
}
