"use server";

import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { sendEmail } from "@/server/email/send";

export async function nudgeMenteeAction(input: { enrollmentId: string }) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: input.enrollmentId },
    include: {
      user: { select: { email: true, name: true } },
      course: { select: { id: true, title: true } },
    },
  });
  if (!enrollment) return { ok: false as const, error: "Enrollment not found" };

  await requireMentorOfCourse(enrollment.courseId);

  const email = enrollment.user.email;
  if (!email) return { ok: false as const, error: "Mentee has no email on file" };

  const result = await sendEmail({
    to: email,
    subject: `Quick nudge — ${enrollment.course.title}`,
    html: `<p>Hi ${enrollment.user.name ?? "there"},</p>
<p>Your mentor checked in on your progress in <strong>${enrollment.course.title}</strong>.</p>
<p>Pick up where you left off when you have a few minutes today.</p>`,
    text: `Your mentor nudged you about ${enrollment.course.title}.`,
  });

  if (!result.sent) {
    return {
      ok: false as const,
      error: result.reason === "no-api-key" ? "Email not configured (dev)" : "Email failed",
    };
  }

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: { lastNudgeSentAt: new Date() },
  });

  return { ok: true as const };
}
