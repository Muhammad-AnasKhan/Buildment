import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { prisma } from "@/server/db";
import { ForbiddenError, getSessionUser, requireEnrolledMentee } from "@/server/auth/guards";
import { enrollmentGrantsContentAccess } from "@/server/enrollment/lifecycle";
import { CourseOverviewHero } from "@/components/learn/course-overview-hero";
import { CourseSyllabus } from "@/components/learn/course-syllabus";
import { CourseProjectShowcase } from "@/components/learn/course-project-showcase";
import { LearnerBreadcrumb } from "@/components/learn/learner-breadcrumb";
import { bypassProgressGatingForEmail } from "@/server/dev/seed-access";
import {
  pickDefaultOpenModule,
  resolveContinueChapterPath,
  syllabusForEnrollment,
} from "@/server/progress/enrollment-syllabus";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      status: true,
      mentor: { select: { name: true } },
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          title: true,
          chapters: {
            where: { publishedAt: { not: null } },
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

  const user = await getSessionUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-sm text-muted-foreground">Sign in to view this course.</p>
        <Link href="/login" className={cn(buttonVariants(), "mt-4 inline-flex")}>
          Sign in
        </Link>
      </div>
    );
  }

  const enrollmentRecord = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId: course.id, userId: user.id } },
  });

  if (!enrollmentRecord) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
        <div className="mt-16 flex flex-col items-center text-center">
          <Lock className="size-8 text-muted-foreground/50" aria-hidden />
          <p className="mt-3 text-sm font-medium text-foreground">
            You don&apos;t have access to this course
          </p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Enroll from the catalog, use a mentor invite, or ask to be assigned.
          </p>
          {course.status === "PUBLISHED" ? (
            <Link href={`/catalog/${course.slug}`} className={cn(buttonVariants(), "mt-6")}>
              View in catalog
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  if (!enrollmentGrantsContentAccess(enrollmentRecord.lifecycle)) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <Link
          href="/my-courses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          My courses
        </Link>
        <div className="mt-16 flex flex-col items-center text-center">
          <Lock className="size-8 text-muted-foreground/50" aria-hidden />
          <p className="mt-3 text-sm font-medium text-foreground">Payment required</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Complete checkout to unlock chapters and submissions for {course.title}.
          </p>
          <Link
            href={`/courses/${course.slug}/checkout`}
            className={cn(buttonVariants(), "mt-6")}
          >
            Go to checkout
          </Link>
        </div>
      </div>
    );
  }

  let enrolled;
  try {
    enrolled = await requireEnrolledMentee(course.id);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      notFound();
    }
    throw error;
  }

  const { enrollment, user: verifiedUser } = enrolled;
  const bypassLocking = bypassProgressGatingForEmail(verifiedUser.email ?? "");
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
    <div className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-6 sm:py-10">
      <LearnerBreadcrumb courseSlug={course.slug} courseTitle={course.title} />

      <CourseOverviewHero
        difficulty={course.difficulty}
        title={course.title}
        description={course.description}
        projectGoal={course.projectGoal}
        coverUrl={course.coverUrl}
        instructorName={course.mentor.name}
        percentComplete={enrollment.percentComplete}
        chaptersCompleted={enrollment.chaptersCompleted}
        chaptersTotal={flatChapters.length}
        pendingReviews={enrollment.pendingReviews}
        continueHref={resolveContinueChapterPath(course.slug, flatChapters)}
        continueLabel={continueLabel}
        moduleCount={modules.length}
        chapterCount={flatChapters.length}
        estimatedHours={course.estimatedHours}
      />

      <CourseProjectShowcase courseSlug={course.slug} />

      <CourseSyllabus
        courseSlug={course.slug}
        modules={modules}
        defaultOpenModuleId={defaultOpenModuleId}
        percentComplete={enrollment.percentComplete}
        chaptersCompleted={enrollment.chaptersCompleted}
        chaptersTotal={flatChapters.length}
      />
    </div>
  );
}
