import { z } from "zod";
import { email, id, params } from "./common.js";

export const orgIdParams = params("orgId");
export const requestIdParams = params("requestId");
export const userIdParams = params("userId");

export const createOrganizationBody = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(64).optional(),
});
export type CreateOrganizationBody = z.infer<typeof createOrganizationBody>;

const maxEnrollments = z.coerce.number().int().min(1).max(1_000_000);
/** Dates arrive as the `<input type="date">` value; empty means no expiry. */
const expiresAt = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

export const allocationsBody = z.object({
  isAllowed: z.boolean(),
  courses: z.array(z.object({ courseId: id, maxEnrollments, expiresAt })).min(1).max(500),
});
export type AllocationsBody = z.infer<typeof allocationsBody>;

export const approveCourseRequestBody = z.object({ maxEnrollments, expiresAt });
export type ApproveCourseRequestBody = z.infer<typeof approveCourseRequestBody>;

export const instructorAccessBody = z.object({ enabled: z.boolean() });

export const grantInstructorBody = z.object({
  email,
  name: z.string().trim().min(1).max(120).optional(),
});
export type GrantInstructorBody = z.infer<typeof grantInstructorBody>;
