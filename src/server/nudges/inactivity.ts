import "server-only";
import { prisma } from "@/server/db";
import { sendEmail } from "@/server/email/send";

const INACTIVE_DAYS = 3;
const NUDGE_COOLDOWN_DAYS = 7;

export async function sendInactivityNudgesForCourse(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      title: true,
      mentor: { select: { email: true, name: true } },
    },
  });
  if (!course) return { sent: 0 };

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - INACTIVE_DAYS);

  const cooldown = new Date();
  cooldown.setDate(cooldown.getDate() - NUDGE_COOLDOWN_DAYS);

  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId,
      status: "IN_PROGRESS",
      AND: [
        { OR: [{ lastActiveAt: null }, { lastActiveAt: { lt: cutoff } }] },
        { OR: [{ lastNudgeSentAt: null }, { lastNudgeSentAt: { lt: cooldown } }] },
      ],
    },
    include: { user: { select: { email: true, name: true } } },
  });

  let sent = 0;
  for (const enrollment of enrollments) {
    const email = enrollment.user.email;
    if (!email) continue;

    const result = await sendEmail({
      to: email,
      subject: `We miss you on ${course.title}`,
      html: `<p>Hi ${enrollment.user.name ?? "there"},</p>
<p>Your mentor noticed you have not studied <strong>${course.title}</strong> in a few days.</p>
<p>Log in when you can — even 20 minutes keeps momentum.</p>
<p>— buildment</p>`,
      text: `Hi ${enrollment.user.name ?? "there"}, we miss you on ${course.title}. Log in when you can.`,
    });

    if (result.sent) {
      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { lastNudgeSentAt: new Date() },
      });
      sent += 1;
    }
  }

  return { sent };
}
