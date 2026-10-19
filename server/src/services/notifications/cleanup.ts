import { prisma } from "../../db/prisma.js";

// Notification tables only grow with events, but they still need a ceiling. Runs with the daily
// cleanup job. Unread notifications are kept longer than read ones so nothing unseen vanishes soon.

const DAY_MS = 24 * 60 * 60 * 1000;
export const NOTIFICATION_RETENTION = {
  readDays: 90,
  unreadDays: 180,
  finishedEmailDays: 30,
  reminderLogDays: 60,
} as const;

export async function pruneNotifications(now = new Date()) {
  const before = (days: number) => new Date(now.getTime() - days * DAY_MS);
  const [read, unread, emails, reminders] = await prisma.$transaction([
    prisma.notification.deleteMany({
      where: { readAt: { not: null }, createdAt: { lt: before(NOTIFICATION_RETENTION.readDays) } },
    }),
    prisma.notification.deleteMany({ where: { createdAt: { lt: before(NOTIFICATION_RETENTION.unreadDays) } } }),
    prisma.emailOutbox.deleteMany({
      where: { status: { in: ["SENT", "SKIPPED", "FAILED"] }, updatedAt: { lt: before(NOTIFICATION_RETENTION.finishedEmailDays) } },
    }),
    prisma.studyReminderLog.deleteMany({ where: { sentAt: { lt: before(NOTIFICATION_RETENTION.reminderLogDays) } } }),
  ]);
  return {
    notifications: read.count + unread.count,
    emails: emails.count,
    reminderLogs: reminders.count,
  };
}
