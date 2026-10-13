import "server-only";
import { learnAccessDenial } from "@/server/enrollment/resolve-learn-enrollment";
import { prisma } from "@/server/db";

/** Read-only enrollment lookup for block SSR (initial response state). Submissions go through the API. */
export async function findEnrollmentForBlockState(courseId: string, userId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId, userId } },
    select: { id: true, lifecycle: true, userId: true },
  });
  if (learnAccessDenial(enrollment)) return null;
  return enrollment;
}
