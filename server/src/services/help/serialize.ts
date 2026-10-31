import type { HelpMessageView, HelpThreadView } from "../../shared/api/help.js";

export type HelpMessageRow = {
  id: string;
  body: string;
  createdAt: Date;
  authorId: string;
  author: { name: string | null; role: HelpMessageView["authorRole"] };
  replyTo: { id: string; body: string; author: { name: string | null } } | null;
  deliveredAt: Date | null;
  seenAt: Date | null;
};

function fallbackName(name: string | null, fallback: string): string {
  return name ?? fallback;
}

export function mapHelpMessages(
  messages: HelpMessageRow[],
  fallbackAuthorName = "Learner",
): HelpMessageView[] {
  return messages.map((message) => ({
    id: message.id,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    authorId: message.authorId,
    authorName: fallbackName(message.author.name, fallbackAuthorName),
    authorRole: message.author.role,
    replyTo: message.replyTo
      ? {
          id: message.replyTo.id,
          body: message.replyTo.body,
          authorName: fallbackName(
            message.replyTo.author.name,
            fallbackAuthorName,
          ),
        }
      : null,
    deliveredAt: message.deliveredAt ? message.deliveredAt.toISOString() : null,
    seenAt: message.seenAt ? message.seenAt.toISOString() : null,
  }));
}

export function serializeHelpThread(
  thread: {
    id: string;
    status: HelpThreadView["status"];
    messages: HelpMessageRow[];
  } | null,
  fallbackAuthorName = "Learner",
): HelpThreadView | null {
  if (!thread) return null;
  return {
    id: thread.id,
    status: thread.status,
    messages: mapHelpMessages(thread.messages, fallbackAuthorName),
  };
}
