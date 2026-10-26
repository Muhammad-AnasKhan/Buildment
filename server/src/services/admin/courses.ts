import type { CourseStatus } from "../../shared/domain/enums.js";
import { prisma } from "../../db/prisma.js";
import { ConflictError, NotFoundError } from "../../utils/errors.js";
import { ADMIN_AUDIT_ACTIONS, recordAdminAction, type AdminActor } from "./audit.js";

// Course write actions from the admin catalog. Admins can publish, unpublish
// (draft), or archive any course — the mentor still owns its content. Each change
// is audited with the from/to states.

export async function setCourseStatus(actor: AdminActor, courseId: string, status: CourseStatus): Promise<void> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, title: true, slug: true, status: true, publishedAt: true },
  });
  if (!course) throw new NotFoundError("Course not found");
  if (course.status === status) {
    throw new ConflictError(`This course is already ${status.toLowerCase()}.`, "STATUS_UNCHANGED");
  }

  await prisma.$transaction(async (tx) => {
    await tx.course.update({
      where: { id: courseId },
      // Publishing stamps publishedAt the first time; unpublishing/archiving keeps history.
      data: {
        status,
        ...(status === "PUBLISHED" && !course.publishedAt ? { publishedAt: new Date() } : {}),
      },
    });
    await recordAdminAction(tx, {
      actor,
      action: ADMIN_AUDIT_ACTIONS.COURSE_SET_STATUS,
      targetType: "Course",
      targetId: courseId,
      summary: `Set ${course.title} to ${status.toLowerCase()} (was ${course.status.toLowerCase()})`,
      metadata: { from: course.status, to: status, slug: course.slug },
    });
  });
}
