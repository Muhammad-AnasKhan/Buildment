import type { CatalogCourseSummary } from "@/shared/api/catalog";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { CatalogCourseCard } from "@/components/learn/catalog-course-card";

export default async function CatalogPage() {
  await requireLearnSurface();
  const { courses } = await serverApiFetch<{ courses: CatalogCourseSummary[] }>("/api/v1/catalog");

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="border-b border-border pb-7">
        <p className="text-sm font-medium text-muted-foreground">Explore</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Course catalog</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Enroll in published courses. Paid courses use a checkout stub until Stripe is connected.
        </p>
      </header>

      {courses.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">No published courses yet.</p>
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const lifecycle = course.enrollmentLifecycle;
            const enrolledLabel =
              lifecycle === "PAYMENT_REQUIRED"
                ? "Payment due"
                : lifecycle
                  ? "Enrolled"
                  : null;

            return (
              <li key={course.id}>
                <CatalogCourseCard
                  slug={course.slug}
                  title={course.title}
                  description={course.description}
                  coverUrl={course.coverUrl}
                  difficulty={course.difficulty}
                  estimatedHours={course.estimatedHours}
                  pricingType={course.pricingType}
                  priceCents={course.priceCents}
                  currency={course.currency}
                  instructorName={course.instructorName}
                  enrolledLabel={enrolledLabel}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
