import { TEACH_ERROR_CODES } from "../../shared/api/teach.js";
import { prisma } from "../../db/prisma.js";
import { NotFoundError, UnprocessableError } from "../../utils/errors.js";
import type { SessionUser } from "../../types/auth.js";
import { sendEmail } from "../email/send.js";
import { repairEnrollmentProgress } from "../progress/compute.js";
import { requireCourseById } from "./access.js";

// Per-enrollment mentor tools: a manual check-in email and the progress repair.

async function requireEnrollment(user: SessionUser, enrollmentId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      user: { select: { email: true, name: true } },
      learnerProfile: { select: { email: true } },
      course: { select: { id: true, title: true } },
    },
  });
  if (!enrollment) throw new NotFoundError("Enrollment not found");
  await requireCourseById(user, enrollment.courseId);
  return enrollment;
}

/** Sends a short "pick up where you left off" email and records when it went out. */
export async function nudgeMentee(user: SessionUser, enrollmentId: string): Promise<void> {
  const enrollment = await requireEnrollment(user, enrollmentId);
  const email = enrollment.user?.email ?? enrollment.learnerProfile?.email;
  if (!email) throw new UnprocessableError("Mentee has no email on file", TEACH_ERROR_CODES.NO_EMAIL_ON_FILE);

  const result = await sendEmail({
    to: email,
    subject: `Quick nudge — ${enrollment.course.title}`,
    html: `<p>Hi ${enrollment.user?.name ?? "there"},</p>
<p>Your mentor checked in on your progress in <strong>${enrollment.course.title}</strong>.</p>
<p>Pick up where you left off when you have a few minutes today.</p>`,
    text: `Your mentor nudged you about ${enrollment.course.title}.`,
  });

  if (!result.sent) {
    throw result.reason === "no-api-key"
      ? new UnprocessableError("Email not configured (dev)", TEACH_ERROR_CODES.EMAIL_NOT_CONFIGURED)
      : new UnprocessableError("Email failed", TEACH_ERROR_CODES.EMAIL_FAILED);
  }

  await prisma.enrollment.update({ where: { id: enrollment.id }, data: { lastNudgeSentAt: new Date() } });
}

/** Rebuilds chapter and enrollment rollups from the Response rows. */
export async function repairProgress(user: SessionUser, enrollmentId: string): Promise<void> {
  const enrollment = await requireEnrollment(user, enrollmentId);
  await prisma.$transaction((tx) => repairEnrollmentProgress(tx, enrollment.id, enrollment.courseId));
}
