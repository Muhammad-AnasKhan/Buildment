import { prisma } from "../../db/prisma.js";
import type { AuthenticatedOrganization } from "../../types/auth.js";

const enrollmentInclude = {
  course: { select: { id: true, title: true } },
  learnerProfile: { select: { email: true } },
  user: { select: { email: true } },
} as const;

export type EnrollmentLookup = {
  externalAssignmentId?: string;
  courseId?: string;
  learnerEmail?: string;
};

export type IntegrationEnrollmentRow = NonNullable<Awaited<ReturnType<typeof findOrganizationEnrollment>>>;

/** By external assignment id when given, otherwise by course + learner email. */
export async function findOrganizationEnrollment(org: AuthenticatedOrganization, lookup: EnrollmentLookup) {
  if (lookup.externalAssignmentId) {
    return prisma.enrollment.findFirst({
      where: { organizationId: org.id, externalAssignmentId: lookup.externalAssignmentId },
      include: enrollmentInclude,
    });
  }
  if (!lookup.courseId || !lookup.learnerEmail) return null;

  return prisma.enrollment.findFirst({
    where: {
      organizationId: org.id,
      courseId: lookup.courseId,
      OR: [{ learnerProfile: { email: lookup.learnerEmail } }, { user: { email: lookup.learnerEmail } }],
    },
    include: enrollmentInclude,
  });
}

export function serializeIntegrationEnrollment(enrollment: IntegrationEnrollmentRow) {
  const email = enrollment.user?.email ?? enrollment.learnerProfile?.email ?? null;
  return {
    enrollment_id: enrollment.id,
    course_id: enrollment.courseId,
    course_title: enrollment.course.title,
    learner_email: email,
    lifecycle: enrollment.lifecycle,
    status: enrollment.status,
    source: enrollment.source,
    external_mentor_id: enrollment.externalMentorId,
    external_assignment_id: enrollment.externalAssignmentId,
    percent_complete: enrollment.percentComplete,
    created_at: enrollment.createdAt.toISOString(),
  };
}
