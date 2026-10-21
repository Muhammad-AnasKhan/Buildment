import Link from "next/link";
import type { CatalogCourseDetail } from "@/shared/api/catalog";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetchOrNotFound } from "@/lib/api-server";
import { selfEnrollInCourseAction } from "@/server/actions/enroll";
import { CourseCover } from "@/components/learn/course-cover";
import { formatPriceCents } from "@/lib/format-price";
import { buttonVariants } from "@/components/ui/button";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { CourseProjectShowcase } from "@/components/learn/course-project-showcase";
import { CourseRoadmap } from "@/components/learn/course-roadmap";

export default async function CatalogCoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  await requireLearnSurface();
  const course = await serverApiFetchOrNotFound<CatalogCourseDetail>(`/api/v1/catalog/${encodeURIComponent(courseSlug)}`);
  const hasAccess = course.access === "active";
  const needsPayment = course.access === "payment_required";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
      <Link href="/catalog" className="text-sm text-muted-foreground hover:text-foreground">
        ← Catalog
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
        <CourseCover coverUrl={course.coverUrl} title={course.title} aspect="banner" className="rounded-none" />
        <header className="border-b border-border p-6 sm:p-8 lg:p-10">
        <p className="text-sm text-muted-foreground">
          {course.instructorName ? `Instructor · ${course.instructorName}` : "Instructor-led course"}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{course.title}</h1>
        {course.description ? (
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{course.description}</p>
        ) : null}
        <dl className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {course.difficulty ? (
            <div>
              <dt className="sr-only">Difficulty</dt>
              <dd>{course.difficulty}</dd>
            </div>
          ) : null}
          {course.estimatedHours ? (
            <div>
              <dt className="sr-only">Duration</dt>
              <dd>~{course.estimatedHours} hours</dd>
            </div>
          ) : null}
          <div>
            <dt className="sr-only">Price</dt>
            <dd className="font-medium text-foreground">
              {course.pricingType === "PAID"
                ? formatPriceCents(course.priceCents, course.currency)
                : "Free"}
            </dd>
          </div>
        </dl>
      </header>
      </div>

      <div className="mt-6">
        <CourseProjectShowcase courseSlug={course.slug} />
      </div>

      {course.slug === "multi-vendor-marketplace" ? <div className="mt-6"><CourseRoadmap modules={course.modules} /></div> : null}

      {course.slug !== "multi-vendor-marketplace" && course.modules.some((module) => module.chapters.length > 0) ? (
        <section className="mt-6 overflow-hidden rounded-2xl border bg-card">
          <div className="p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Explore the syllabus</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">Course curriculum</h2>
            <p className="mt-1 text-sm text-muted-foreground">{course.moduleCount} modules · {course.chapterCount} lessons. Open a module to see its lesson list.</p>
          </div>
          <div className="border-t">
            {course.modules.map((module) => module.chapters.length === 0 ? null : (
              <details key={module.id} className="group border-b last:border-b-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 hover:bg-muted/25 sm:px-7 [&::-webkit-details-marker]:hidden">
                  <span className="flex min-w-0 items-center gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-lg border bg-muted/30 font-mono text-xs text-muted-foreground">{String(module.order).padStart(2, "0")}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold">{module.title}</span><span className="mt-0.5 block text-xs text-muted-foreground">{module.chapters.length} lessons</span></span></span>
                  <span className="text-xs text-muted-foreground group-open:hidden">View lessons</span><span className="hidden text-xs text-muted-foreground group-open:inline">Hide lessons</span>
                </summary>
                <ol className="divide-y border-t bg-muted/10 px-5 sm:px-7">
                  {module.chapters.map((chapter) => <li key={chapter.id} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="min-w-0"><span className="mr-2 font-mono text-xs text-muted-foreground">{String(module.order).padStart(2, "0")}.{String(chapter.order).padStart(2, "0")}</span>{chapter.title}</span>{chapter.estimatedMinutes ? <span className="shrink-0 text-xs text-muted-foreground">{chapter.estimatedMinutes} min</span> : null}</li>)}
                </ol>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {course.projectGoal ? (
        <section className="mt-6 rounded-xl border bg-muted/20 p-4 text-sm">
          <p className="font-medium text-foreground">What you&apos;ll build</p>
          <p className="mt-1 text-muted-foreground">{course.projectGoal}</p>
        </section>
      ) : null}

      <div className="sticky bottom-3 z-10 mt-8 flex flex-wrap items-center gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
        {hasAccess ? (
          <Link href={`/courses/${course.slug}`} className={buttonVariants({ size: "lg" })}>
            Go to course
          </Link>
        ) : needsPayment ? (
          <Link
            href={`/courses/${course.slug}/checkout`}
            className={buttonVariants({ size: "lg" })}
          >
            Complete payment
          </Link>
        ) : (
          <form action={selfEnrollInCourseAction}>
            <input type="hidden" name="courseId" value={course.id} />
            <input type="hidden" name="courseSlug" value={course.slug} />
            <input type="hidden" name="returnTo" value={`/courses/${course.slug}`} />
            <PendingSubmitButton size="lg" pendingLabel="Enrolling…" className="h-10 px-4">
              {course.pricingType === "PAID" ? "Enroll & checkout" : "Enroll for free"}
            </PendingSubmitButton>
          </form>
        )}
        {!hasAccess && !needsPayment ? (
          <p className="w-full text-xs text-muted-foreground">
            You can also join via a mentor invite link if you were assigned privately.
          </p>
        ) : null}
      </div>
    </div>
  );
}
