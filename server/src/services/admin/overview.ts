import type { AdminCourseRow, AdminOverview } from "../../shared/api/admin.js";
import { prisma } from "../../db/prisma.js";

const COURSE_LIST_LIMIT = 200;

/** Tile counts for the admin home and the shell's badges. */
export async function loadOverview(): Promise<AdminOverview> {
  const [organizations, pendingCourseRequests, publishedCourses, instructors] = await Promise.all([
    prisma.organization.count(),
    prisma.organizationCourseRequest.count({ where: { status: "PENDING" } }),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.user.count({ where: { role: "MENTOR" } }),
  ]);
  return { organizations, pendingCourseRequests, publishedCourses, instructors };
}

/** Read-only catalog for support and allocation decisions. */
export async function listCourses(): Promise<AdminCourseRow[]> {
  const courses = await prisma.course.findMany({
    orderBy: { updatedAt: "desc" },
    take: COURSE_LIST_LIMIT,
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      pricingType: true,
      priceCents: true,
      currency: true,
      updatedAt: true,
      mentor: { select: { email: true, name: true } },
      _count: { select: { enrollments: true, organizationCourses: true } },
    },
  });
  return courses.map(({ mentor, _count, updatedAt, ...course }) => ({
    ...course,
    updatedAt: updatedAt.toISOString(),
    instructorLabel: mentor.name ?? mentor.email,
    enrollmentCount: _count.enrollments,
    allocationCount: _count.organizationCourses,
  }));
}
