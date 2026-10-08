import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { lifecycleForSignedInEnrollment } from "@/server/enrollment/lifecycle";

/** After verified signup/login, attach pending Pathment enrollments for the same email. */
export async function linkLearnerProfileToUser(db: PrismaClient, userId: string, email: string) {
  const normalized = email.trim().toLowerCase();
  const profile = await db.learnerProfile.findUnique({ where: { email: normalized } });
  if (!profile) return;

  await db.learnerProfile.update({
    where: { id: profile.id },
    data: { userId, linkedAt: new Date() },
  });

  const pending = await db.enrollment.findMany({
    where: {
      learnerProfileId: profile.id,
      userId: null,
    },
    include: { course: true },
  });

  for (const enrollment of pending) {
    const lifecycle = lifecycleForSignedInEnrollment(enrollment.course.pricingType);
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: {
        userId,
        lifecycle,
        status: lifecycle === "ACTIVE" ? "IN_PROGRESS" : enrollment.status,
      },
    });
    if (lifecycle === "PAYMENT_REQUIRED") {
      await db.payment.upsert({
        where: { enrollmentId: enrollment.id },
        create: {
          enrollmentId: enrollment.id,
          amountCents: enrollment.course.priceCents,
          currency: enrollment.course.currency,
          status: "PENDING",
        },
        update: {},
      });
    }
  }
}
