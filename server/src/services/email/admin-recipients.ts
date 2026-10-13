
import { prisma } from "../../db/prisma.js";
import { env } from "../../config/env.js";

/** Comma-separated extra inboxes (e.g. ops@) in addition to users with role ADMIN. */
function adminEmailsFromEnv(): string[] {
  return env.ADMIN_NOTIFY_EMAIL.map((email) => email.toLowerCase()).filter((email) => email.includes("@"));
}

export async function listAdminNotificationEmails(): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { email: true },
  });
  const combined = [
    ...adminEmailsFromEnv(),
    ...admins.map((row) => row.email.trim().toLowerCase()),
  ];
  return [...new Set(combined)];
}
