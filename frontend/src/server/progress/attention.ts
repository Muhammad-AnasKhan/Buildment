import { allowRetryFromConfig } from "./rules";

const SCORED_TYPES = new Set(["QUIZ", "PREDICT", "CODE"]);

export function mentorReplyUnread(args: {
  menteeId: string;
  menteeLastReadAt: Date | null;
  latestMessage: { authorId: string; createdAt: Date } | null;
}): boolean {
  const message = args.latestMessage;
  if (!message || message.authorId === args.menteeId) return false;
  if (!args.menteeLastReadAt) return true;
  return message.createdAt.getTime() > args.menteeLastReadAt.getTime();
}

export type ClosedWrongInput = {
  blockId: string;
  attempt: number;
  isCorrect: boolean | null;
  block: {
    type: string;
    config: unknown;
    chapter: { slug: string; title: string; course: { slug: string; title: string } };
  };
};

export function closedWrongCheckpoints<T extends ClosedWrongInput>(responses: T[]): T[] {
  const latest = new Map<string, T>();
  for (const response of [...responses].sort((a, b) => b.attempt - a.attempt)) {
    if (!latest.has(response.blockId)) latest.set(response.blockId, response);
  }
  return [...latest.values()].filter(
    (response) =>
      SCORED_TYPES.has(response.block.type) &&
      response.isCorrect === false &&
      !allowRetryFromConfig(response.block.config),
  );
}
