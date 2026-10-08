import { prisma } from "@/server/db";
import { requireLearnSurface } from "@/server/auth/guards";
import { CatalogCourseCard } from "@/components/learn/catalog-course-card";

export default async function CatalogPage() {
  const user = await requireLearnSurface();

  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { title: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      coverUrl: true,
      difficulty: true,
      estimatedHours: true,
      pricingType: true,
      priceCents: true,
      currency: true,
      mentor: { select: { name: true } },
    },
  });

  const enrolled = await prisma.enrollment.findMany({
    where: { userId: user.id, courseId: { in: courses.map((c) => c.id) } },
    select: { courseId: true, lifecycle: true },
  });
  const enrolledByCourse = new Map(enrolled.map((e) => [e.courseId, e.lifecycle]));

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
            const lifecycle = enrolledByCourse.get(course.id);
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
                  instructorName={course.mentor.name}
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
