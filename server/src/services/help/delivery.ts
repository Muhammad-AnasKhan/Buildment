import { prisma } from "../../db/prisma.js";
import { publish } from "../realtime/hub.js";

const DELIVERY_BATCH_LIMIT = 500;

/**
 * Called when a user's stream opens (they came online): messages written to them while
 * they were away are now "delivered", and each author is told so their ticks update.
 */
export async function markDeliveredForUser(userId: string): Promise<void> {
  const pending = await prisma.helpMessage.findMany({
    where: {
      deliveredAt: null,
      authorId: { not: userId },
      thread: { OR: [{ menteeId: userId }, { course: { mentorId: userId } }] },
    },
    select: { id: true, authorId: true, threadId: true },
    take: DELIVERY_BATCH_LIMIT,
  });
  if (pending.length === 0) return;

  const now = new Date();
  await prisma.helpMessage.updateMany({ where: { id: { in: pending.map((message) => message.id) } }, data: { deliveredAt: now } });

  const grouped = new Map<string, { authorId: string; threadId: string; messageIds: string[] }>();
  for (const message of pending) {
    const key = `${message.authorId}:${message.threadId}`;
    const entry = grouped.get(key) ?? { authorId: message.authorId, threadId: message.threadId, messageIds: [] };
    entry.messageIds.push(message.id);
    grouped.set(key, entry);
  }
  for (const entry of grouped.values()) {
    publish(entry.authorId, "help-status", { threadId: entry.threadId, messageIds: entry.messageIds, status: "delivered", at: now.toISOString() });
  }
}
