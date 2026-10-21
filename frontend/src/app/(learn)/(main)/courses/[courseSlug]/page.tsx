import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import type { CourseOverview } from "@/shared/api/catalog";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { CourseOverviewHero } from "@/components/learn/course-overview-hero";
import { CourseSyllabus } from "@/components/learn/course-syllabus";
import { CourseProjectShowcase } from "@/components/learn/course-project-showcase";
import { SpecialisationPanel, VariantBanner } from "@/components/learn/course-track-panels";
import { VariantThemeScope, variantForTrack } from "@/components/learn/variant-theme";
import { LearnerBreadcrumb } from "@/components/learn/learner-breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;

  await requireLearnSurface();
  const overview = await serverApiFetchOrNotFound<CourseOverview>(`/api/v1/courses/${encodeURIComponent(courseSlug)}/overview`);
  const { course, enrollment, syllabus } = overview;

  if (overview.access === "none" || !enrollment) {
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

  if (overview.access === "payment_required" || !syllabus) {
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

  const { modules, chapterCount, continueHref, defaultOpenModuleId } = syllabus;
  const { track } = overview;

  // A course in a family starts with the variant choice, whichever way the learner enrolled.
  if (track && !track.variantChosen && enrollment.chaptersCompleted === 0) {
    redirect(`/courses/${course.slug}/variant`);
  }

  const continueLabel =
    enrollment.percentComplete === 0
      ? "Start learning"
      : enrollment.percentComplete >= 100
        ? "Review course"
        : "Continue learning";

  return (
    <VariantThemeScope variant={variantForTrack(track)}>
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-6 sm:py-10">
        <LearnerBreadcrumb courseSlug={course.slug} courseTitle={course.title} />

        <CourseOverviewHero
          difficulty={course.difficulty}
          title={course.title}
          description={course.description}
          projectGoal={course.projectGoal}
          coverUrl={course.coverUrl}
          instructorName={course.instructorName}
          percentComplete={enrollment.percentComplete}
          chaptersCompleted={enrollment.chaptersCompleted}
          chaptersTotal={chapterCount}
          pendingReviews={enrollment.pendingReviews}
          continueHref={continueHref}
          continueLabel={continueLabel}
          moduleCount={modules.length}
          chapterCount={chapterCount}
          estimatedHours={course.estimatedHours}
        />

        {track ? <VariantBanner courseSlug={course.slug} track={track} /> : null}

        {track?.specialisationOpen ? <SpecialisationPanel courseSlug={course.slug} track={track} /> : null}

        <CourseProjectShowcase courseSlug={course.slug} />

        <CourseSyllabus
          courseSlug={course.slug}
          modules={modules}
          defaultOpenModuleId={defaultOpenModuleId}
          percentComplete={enrollment.percentComplete}
          chaptersCompleted={enrollment.chaptersCompleted}
          chaptersTotal={chapterCount}
        />

        {track && !track.specialisationOpen ? <SpecialisationPanel courseSlug={course.slug} track={track} /> : null}
      </div>
    </VariantThemeScope>
  );
}
