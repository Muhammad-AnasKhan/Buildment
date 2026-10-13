import "server-only";

import { prisma } from "@/server/db";

/** Comma-separated extra inboxes (e.g. ops@) in addition to users with role ADMIN. */
function adminEmailsFromEnv(): string[] {
  const raw = process.env.ADMIN_NOTIFY_EMAIL?.trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((email) => email.includes("@"));
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
