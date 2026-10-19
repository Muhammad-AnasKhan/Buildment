import { prisma } from "../../db/prisma.js";
import { env } from "../../config/env.js";

/** Comma-separated extra inboxes (e.g. ops@) in addition to users with role ADMIN. */
function adminEmailsFromEnv(): string[] {
  return env.ADMIN_NOTIFY_EMAIL.map((email) => email.toLowerCase()).filter((email) => email.includes("@"));
}

/**
 * Who hears about admin queue items: every ADMIN account (in-app and email, by their own
 * preferences) plus ADMIN_NOTIFY_EMAIL inboxes that are not already one of those accounts (email).
 */
export async function listAdminRecipients(): Promise<{ userIds: string[]; extraEmails: string[] }> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, email: true },
  });
  const adminEmails = new Set(admins.map((admin) => admin.email.trim().toLowerCase()));
  return {
    userIds: admins.map((admin) => admin.id),
    extraEmails: [...new Set(adminEmailsFromEnv())].filter((email) => !adminEmails.has(email)),
  };
}
