import { prisma } from "@/server/db";
import type { AuthenticatedOrganization } from "@/server/integrations/authenticate-organization";

const enrollmentInclude = {
  course: { select: { id: true, title: true } },
  learnerProfile: { select: { email: true } },
  user: { select: { email: true } },
} as const;

export type IntegrationEnrollmentRow = Awaited<
  ReturnType<typeof findOrganizationEnrollment>
>;

export async function findOrganizationEnrollment(
  org: AuthenticatedOrganization,
  query: URLSearchParams
) {
  const courseId = query.get("course_id")?.trim();
  const learnerEmail = query.get("learner_email")?.trim().toLowerCase();
  const externalAssignmentId = query.get("external_assignment_id")?.trim();

  if (externalAssignmentId) {
    return prisma.enrollment.findFirst({
      where: {
        organizationId: org.id,
        externalAssignmentId,
      },
      include: enrollmentInclude,
    });
  }

  if (!courseId || !learnerEmail) {
    return null;
  }

  return prisma.enrollment.findFirst({
    where: {
      organizationId: org.id,
      courseId,
      OR: [{ learnerProfile: { email: learnerEmail } }, { user: { email: learnerEmail } }],
    },
    include: enrollmentInclude,
  });
}

export function missingEnrollmentLookupParams(query: URLSearchParams): boolean {
  const externalAssignmentId = query.get("external_assignment_id")?.trim();
  if (externalAssignmentId) return false;
  const courseId = query.get("course_id")?.trim();
  const learnerEmail = query.get("learner_email")?.trim();
  return !courseId || !learnerEmail;
}

export function serializeIntegrationEnrollment(
  enrollment: NonNullable<IntegrationEnrollmentRow>
) {
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
