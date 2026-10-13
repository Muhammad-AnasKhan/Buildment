import { z } from "zod";
import { email, id } from "./common.js";

const optionalId = z.string().trim().min(1).optional();

// Either an external assignment id, or course + learner email.
export const enrollmentLookupQuery = z
  .object({
    external_assignment_id: optionalId,
    course_id: optionalId,
    learner_email: email.optional(),
  })
  .refine((q) => Boolean(q.external_assignment_id) || Boolean(q.course_id && q.learner_email), {
    message: "Provide external_assignment_id or both course_id and learner_email query parameters",
  });
export type EnrollmentLookupQuery = z.infer<typeof enrollmentLookupQuery>;

export const createEnrollmentBody = z.object({
  student_email: z.string().email(),
  course_id: id,
  mentor_id: z.string().optional(),
  external_assignment_id: z.string().optional(),
});
export type CreateEnrollmentBody = z.infer<typeof createEnrollmentBody>;

export const cancelEnrollmentBody = z.object({
  org_slug: id,
  email: z.string().email(),
  course_id: id,
  user_id: optionalId,
  mentor_id: optionalId,
  external_assignment_id: optionalId,
});
export type CancelEnrollmentBody = z.infer<typeof cancelEnrollmentBody>;

export const progressQuery = z.object({
  course_id: id,
  learner_email: email,
});

export const courseRequestsQuery = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
});

export const createCourseRequestBody = z.object({ course_id: id });
