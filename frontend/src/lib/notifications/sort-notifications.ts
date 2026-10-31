import type { NotificationItem } from "@/shared/api/notifications";

/** Message-style notifications the learner usually wants first in the drawer. */
const MESSAGE_TYPES = new Set([
  "help.question",
  "help.reply",
  "help.resolved",
  "review.pending",
  "review.feedback",
]);

function messagePriority(item: NotificationItem): number {
  if (MESSAGE_TYPES.has(item.type) || item.category === "activity") return 0;
  return 1;
}

/**
 * Unread first, then message/activity items, then newest createdAt.
 * Keeps the bell drawer useful when someone opens it mid-conversation.
 */
export function sortNotificationsForInbox(items: NotificationItem[]): NotificationItem[] {
  return [...items].sort((a, b) => {
    const unreadA = a.readAt ? 1 : 0;
    const unreadB = b.readAt ? 1 : 0;
    if (unreadA !== unreadB) return unreadA - unreadB;

    const messageA = messagePriority(a);
    const messageB = messagePriority(b);
    if (messageA !== messageB) return messageA - messageB;

    if (a.createdAt === b.createdAt) return a.id < b.id ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}
