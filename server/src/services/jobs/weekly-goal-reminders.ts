import { prisma } from "../../db/prisma.js";
import { appBaseUrl, emailConfigured, sendEmail } from "../email/send.js";
import { escapeHtml } from "../email/format.js";
import { loadLearnerHabit } from "../progress/learner-habit.js";
import { logger } from "../../utils/logger.js";

/** Send at most one reminder per UTC day to learners who opted in and still have work toward their goal. */
export async function runWeeklyGoalReminders(): Promise<{ emailsSent: number; eligible: number }> {
  if (!emailConfigured()) return { emailsSent: 0, eligible: 0 };

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const learners = await prisma.user.findMany({
    where: {
      weeklyGoalReminderEnabled: true,
      weeklyGoalKind: { not: null },
      weeklyGoalTarget: { gt: 0 },
      emailVerified: { not: null },
      enrollments: { some: { status: { not: "DROPPED" } } },
      OR: [{ weeklyGoalReminderSentOn: null }, { weeklyGoalReminderSentOn: { lt: today } }],
    },
    select: { id: true, email: true, name: true },
  });

  let emailsSent = 0;
  let eligible = 0;
  for (const learner of learners) {
    const goal = (await loadLearnerHabit(learner.id)).weeklyGoal;
    if (!goal || !goal.dailyReminder || goal.progress >= goal.target) continue;
    eligible += 1;

    // Claim the day before sending so two schedulers cannot email the same learner twice.
    const claim = await prisma.user.updateMany({
      where: {
        id: learner.id,
        weeklyGoalReminderEnabled: true,
        OR: [{ weeklyGoalReminderSentOn: null }, { weeklyGoalReminderSentOn: { lt: today } }],
      },
      data: { weeklyGoalReminderSentOn: today },
    });
    if (claim.count === 0) continue;

    const unit = goal.kind === "CHAPTERS" ? "chapters" : "study sessions";
    const remaining = goal.target - goal.progress;
    const greeting = learner.name?.trim() || "there";
    const noteText = goal.note ? `Your focus: ${goal.note}\n\n` : "";
    const noteHtml = goal.note ? `<p><strong>Your focus:</strong> ${escapeHtml(goal.note)}</p>` : "";
    const dashboardUrl = `${appBaseUrl()}/dashboard`;

    try {
      const result = await sendEmail({
        to: learner.email,
        subject: `Your weekly goal: ${goal.progress} of ${goal.target} ${unit}`,
        text: `Hi ${greeting},\n\nYou have completed ${goal.progress} of ${goal.target} ${unit} in the last 7 days. ${remaining} to go.\n\n${noteText}Continue learning: ${dashboardUrl}\n\nYou can turn off daily reminders from your weekly goal on the dashboard.`,
        html: `<p>Hi ${escapeHtml(greeting)},</p><p>You have completed <strong>${goal.progress} of ${goal.target} ${unit}</strong> in the last 7 days. ${remaining} to go.</p>${noteHtml}<p><a href="${escapeHtml(dashboardUrl)}">Continue learning</a></p><p>You can turn off daily reminders from your weekly goal on the dashboard.</p>`,
      });
      if (result.sent) {
        emailsSent += 1;
        continue;
      }
      logger.warn({ userId: learner.id, reason: result.reason }, "[jobs] weekly goal reminder not sent");
    } catch (error) {
      logger.error({ userId: learner.id, err: error }, "[jobs] weekly goal reminder failed");
    }

    // A failed delivery may be retried by a later job run on the same day.
    await prisma.user.updateMany({
      where: { id: learner.id, weeklyGoalReminderSentOn: today },
      data: { weeklyGoalReminderSentOn: null },
    });
  }

  return { emailsSent, eligible };
}
