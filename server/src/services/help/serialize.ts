import type { HelpMessageView, HelpThreadView } from "../../shared/api/help.js";

export type HelpMessageRow = {
  id: string;
  body: string;
  createdAt: Date;
  authorId: string;
  author: { name: string | null; role: HelpMessageView["authorRole"] };
};

export function mapHelpMessages(messages: HelpMessageRow[], fallbackAuthorName = "Learner"): HelpMessageView[] {
  return messages.map((message) => ({
    id: message.id,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    authorId: message.authorId,
    authorName: message.author.name ?? fallbackAuthorName,
    authorRole: message.author.role,
  }));
}

export function serializeHelpThread(
  thread: { id: string; status: HelpThreadView["status"]; messages: HelpMessageRow[] } | null,
  fallbackAuthorName = "Learner"
): HelpThreadView | null {
  if (!thread) return null;
  return { id: thread.id, status: thread.status, messages: mapHelpMessages(thread.messages, fallbackAuthorName) };
}
