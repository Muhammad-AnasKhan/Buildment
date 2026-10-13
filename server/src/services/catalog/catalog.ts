import type { CatalogCourseDetail, CatalogCourseSummary } from "@buildment/shared/api/catalog";
import { prisma } from "../../db/prisma.js";
import { NotFoundError } from "../../utils/errors.js";
import { enrollmentGrantsContentAccess } from "../enrollment/lifecycle.js";

const summarySelect = {
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
} as const;

export async function listCatalog(userId: string): Promise<CatalogCourseSummary[]> {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { title: "asc" },
    select: summarySelect,
  });
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, courseId: { in: courses.map((course) => course.id) } },
    select: { courseId: true, lifecycle: true },
  });
  const lifecycleByCourse = new Map(enrollments.map((row) => [row.courseId, row.lifecycle]));

  return courses.map(({ mentor, ...course }) => ({
    ...course,
    instructorName: mentor.name,
    enrollmentLifecycle: lifecycleByCourse.get(course.id) ?? null,
  }));
}

export async function getCatalogCourse(courseSlug: string, userId: string): Promise<CatalogCourseDetail> {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      ...summarySelect,
      status: true,
      projectGoal: true,
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
  if (!course || course.status !== "PUBLISHED") throw new NotFoundError("Course not found");

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId: course.id, userId } },
    select: { lifecycle: true },
  });
  const { mentor, status: _status, ...rest } = course;

  return {
    ...rest,
    instructorName: mentor.name,
    enrollmentLifecycle: enrollment?.lifecycle ?? null,
    access: !enrollment
      ? "none"
      : enrollmentGrantsContentAccess(enrollment.lifecycle)
        ? "active"
        : enrollment.lifecycle === "PAYMENT_REQUIRED"
          ? "payment_required"
          : "none",
  };
}
