import { prisma } from "../../db/prisma.js";
import { NotFoundError } from "../../utils/errors.js";
import type { AuthenticatedOrganization } from "../../types/auth.js";
import type { CancelEnrollmentBody, CreateEnrollmentBody, EnrollmentLookupQuery } from "../../validations/integrations.js";
import { notifyMenteeCourseEnrollment, notifyMentorNewEnrollment } from "../notifications/events.js";
import { dispatchNotification } from "../notifications/service.js";
import { findOrganizationEnrollment, serializeIntegrationEnrollment } from "./enrollment-lookup.js";
import { createPathmentEnrollment } from "./pathment/create-pathment-enrollment.js";
import { cancelPathmentEnrollment } from "./pathment/cancel-pathment-enrollment.js";

export async function lookupEnrollment(org: AuthenticatedOrganization, query: EnrollmentLookupQuery) {
  const enrollment = await findOrganizationEnrollment(org, {
    externalAssignmentId: query.external_assignment_id,
    courseId: query.course_id,
    learnerEmail: query.learner_email,
  });
  if (!enrollment) throw new NotFoundError("Enrollment not found");
  return serializeIntegrationEnrollment(enrollment);
}

/** Create (or return the existing) organisation enrollment; emails go out only on creation. */
export async function createEnrollment(org: AuthenticatedOrganization, body: CreateEnrollmentBody) {
  const { enrollment, created } = await createPathmentEnrollment(prisma, {
    organizationId: org.id,
    courseId: body.course_id,
    studentEmail: body.student_email,
    mentorId: body.mentor_id ?? null,
    externalAssignmentId: body.external_assignment_id ?? null,
  });

  if (created) {
    await dispatchNotification(() => notifyMenteeCourseEnrollment(enrollment.id));
    await dispatchNotification(() => notifyMentorNewEnrollment(enrollment.id));
  }

  return {
    created,
    body: {
      enrollment_id: enrollment.id,
      course_id: enrollment.courseId,
      learner_email: body.student_email,
      lifecycle: enrollment.lifecycle,
      created,
      external_mentor_id: enrollment.externalMentorId,
      external_assignment_id: enrollment.externalAssignmentId,
    },
  };
}

export async function cancelEnrollment(org: AuthenticatedOrganization, body: CancelEnrollmentBody) {
  const result = await cancelPathmentEnrollment(
    prisma,
    { organizationId: org.id, slug: org.slug },
    {
      organizationId: org.id,
      orgSlug: body.org_slug,
      courseId: body.course_id,
      email: body.email,
      userId: body.user_id ?? null,
      mentorId: body.mentor_id ?? null,
      externalAssignmentId: body.external_assignment_id ?? null,
    }
  );

  return {
    cancelled: result.cancelled,
    already_cancelled: result.alreadyCancelled,
    enrollment: serializeIntegrationEnrollment(result.enrollment),
  };
}
