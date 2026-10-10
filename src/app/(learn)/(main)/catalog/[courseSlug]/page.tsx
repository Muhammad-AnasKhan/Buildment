import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db";
import { requireLearnSurface } from "@/server/auth/guards";
import { selfEnrollInCourseAction } from "@/server/actions/enroll";
import { enrollmentGrantsContentAccess } from "@/server/enrollment/lifecycle";
import { CourseCover } from "@/components/learn/course-cover";
import { formatPriceCents } from "@/lib/format-price";
import { buttonVariants } from "@/components/ui/button";
import { PendingSubmitButton } from "@/components/ui/pending-submit-button";
import { cn } from "@/lib/utils";

export default async function CatalogCoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const user = await requireLearnSurface();

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverUrl: true,
      projectGoal: true,
      difficulty: true,
      estimatedHours: true,
      pricingType: true,
      priceCents: true,
      currency: true,
      status: true,
      mentor: { select: { name: true } },
      modules: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          chapters: {
            where: { publishedAt: { not: null } },
            orderBy: { order: "asc" },
            select: { id: true, title: true, order: true, estimatedMinutes: true },
          },
        },
      },
    },
  });
  if (!course || course.status !== "PUBLISHED") notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId: course.id, userId: user.id } },
    select: { lifecycle: true },
  });

  const hasAccess = enrollment ? enrollmentGrantsContentAccess(enrollment.lifecycle) : false;
  const needsPayment = enrollment?.lifecycle === "PAYMENT_REQUIRED";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6 sm:py-10">
      <Link href="/catalog" className="text-sm text-muted-foreground hover:text-foreground">
        ← Catalog
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl border bg-card shadow-sm">
        <CourseCover coverUrl={course.coverUrl} title={course.title} aspect="banner" className="rounded-none" />
        <header className="border-b border-border p-6 sm:p-8">
        <p className="text-sm text-muted-foreground">
          {course.mentor.name ? `Instructor · ${course.mentor.name}` : "Instructor-led course"}
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

      {course.modules.some((module) => module.chapters.length > 0) ? (
        <section className="mt-6 rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold">Curriculum</h2>
          <ol className="mt-4 space-y-5">
            {course.modules.map((module) =>
              module.chapters.length === 0 ? null : (
                <li key={module.id}>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {String(module.order).padStart(2, "0")} · {module.title}
                  </p>
                  <ol className="mt-2 space-y-1.5">
                    {module.chapters.map((chapter) => (
                      <li key={chapter.id} className="flex items-baseline justify-between gap-3 text-sm">
                        <span>
                          {String(chapter.order).padStart(2, "0")} {chapter.title}
                        </span>
                        {chapter.estimatedMinutes ? (
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {chapter.estimatedMinutes} min
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </li>
              )
            )}
          </ol>
        </section>
      ) : null}

      {course.projectGoal ? (
        <section className="mt-6 rounded-xl border bg-muted/20 p-4 text-sm">
          <p className="font-medium text-foreground">What you&apos;ll build</p>
          <p className="mt-1 text-muted-foreground">{course.projectGoal}</p>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
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
