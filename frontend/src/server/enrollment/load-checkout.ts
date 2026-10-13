import "server-only";
import { prisma } from "@/server/db";
import { requireVerifiedUser } from "@/server/auth/guards";
import { enrollmentGrantsContentAccess } from "@/server/enrollment/lifecycle";

export async function loadCheckoutForCourseSlug(courseSlug: string) {
  const user = await requireVerifiedUser();
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      slug: true,
      title: true,
      coverUrl: true,
      pricingType: true,
      priceCents: true,
      currency: true,
      status: true,
      description: true,
    },
  });
  if (!course || course.status !== "PUBLISHED") return null;

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId: course.id, userId: user.id } },
    include: { payment: true },
  });

  if (!enrollment) {
    return { course, enrollment: null, userId: user.id };
  }
  if (enrollmentGrantsContentAccess(enrollment.lifecycle)) {
    return { course, enrollment, alreadyPaid: true, userId: user.id };
  }
  if (enrollment.lifecycle !== "PAYMENT_REQUIRED") return null;

  return { course, enrollment, alreadyPaid: false, userId: user.id };
}
