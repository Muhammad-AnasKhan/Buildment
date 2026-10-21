import type { CatalogCourseSummary } from "@/shared/api/catalog";
import type { CourseCategory } from "@/shared/domain/enums";
import { requireLearnSurface } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { COURSE_CATEGORY_INFO, categoryFromParam } from "@/lib/course-categories";
import { CatalogCourseCard } from "@/components/learn/catalog-course-card";
import { CatalogCategoryTiles } from "@/components/learn/catalog-category-tiles";

function CourseGrid({ courses }: { courses: CatalogCourseSummary[] }) {
  return (
    <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
  );
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  await requireLearnSurface();
  const { courses } = await serverApiFetch<{ courses: CatalogCourseSummary[] }>("/api/v1/catalog");
  const active = categoryFromParam((await searchParams).category);

  const counts = { TECH: 0, SOFT_SKILLS: 0 } as Record<CourseCategory, number>;
  for (const course of courses) counts[course.category] += 1;

  // "All" shows every category as its own section; a tile shows one category on its own.
  const sections = COURSE_CATEGORY_INFO.filter((category) => active === null || category.value === active)
    .map((category) => ({ ...category, courses: courses.filter((course) => course.category === category.value) }))
    .filter((section) => section.courses.length > 0 || active !== null);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
      <header className="border-b border-border pb-7">
        <p className="text-sm font-medium text-muted-foreground">Explore</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Course catalog</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Enroll in published courses. Paid courses use a checkout stub until Stripe is connected.
        </p>
        {courses.length > 0 ? <CatalogCategoryTiles counts={counts} total={courses.length} active={active} /> : null}
      </header>

      {courses.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">No published courses yet.</p>
      ) : (
        sections.map((section) => (
          <section key={section.value} aria-labelledby={`catalog-${section.param}`} className="mt-9">
            <h2 id={`catalog-${section.param}`} className="text-xl font-semibold tracking-tight">
              {section.label}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            {section.courses.length > 0 ? (
              <CourseGrid courses={section.courses} />
            ) : (
              <p className="mt-5 text-sm text-muted-foreground">No courses in this category yet.</p>
            )}
          </section>
        ))
      )}
    </div>
  );
}
