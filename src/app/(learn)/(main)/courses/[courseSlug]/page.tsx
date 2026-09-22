import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { prisma } from "@/server/db";
import { ForbiddenError, requireEnrolledMentee } from "@/server/auth/guards";
import { CourseOverviewHero } from "@/components/learn/course-overview-hero";
import { CourseSyllabus } from "@/components/learn/course-syllabus";
import { bypassProgressGatingForEmail } from "@/server/dev/seed-access";
import {
  pickDefaultOpenModule,
  resolveContinueChapterPath,
  syllabusForEnrollment,
} from "@/server/progress/enrollment-syllabus";

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

  const { enrollment, user } = enrolled;
  const bypassLocking = bypassProgressGatingForEmail(user.email ?? "");
  const { modules, flatChapters } = await syllabusForEnrollment(
    course,
    enrollment.id,
    bypassLocking
  );
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
        continueHref={resolveContinueChapterPath(course.slug, flatChapters)}
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
