import { INSTRUCTOR_ACCESS_ERROR_CODES } from "../../shared/api/learner.js";
import { prisma } from "../../db/prisma.js";
import { ConflictError, ForbiddenError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { canAccessTeachSurface } from "../auth/access-rules.js";
import { notifyAdminsInstructorAccessRequest } from "../email/admin-notifications.js";
import { queueEmail } from "../email/queue.js";

/** A learner asks platform admins for instructor tools. One live request per user. */
export async function requestInstructorAccess(user: SessionUser, message?: string) {
  if (canAccessTeachSurface(user)) {
    throw new ConflictError("You already have instructor access.", INSTRUCTOR_ACCESS_ERROR_CODES.ALREADY_INSTRUCTOR);
  }
  if (user.role === "ADMIN") throw new ForbiddenError("Platform admins use the admin console.");

  const existing = await prisma.instructorAccessRequest.findUnique({ where: { userId: user.id }, select: { status: true } });
  if (existing?.status === "PENDING") {
    throw new ConflictError("Your request is already pending review.", INSTRUCTOR_ACCESS_ERROR_CODES.REQUEST_PENDING);
  }

  const request = await prisma.instructorAccessRequest.upsert({
    where: { userId: user.id },
    create: { userId: user.id, status: "PENDING", message: message ?? null },
    update: { status: "PENDING", message: message ?? null, reviewedById: null, reviewedAt: null },
    select: { id: true },
  });
  queueEmail(() => notifyAdminsInstructorAccessRequest(request.id));
  return { requestId: request.id };
}
