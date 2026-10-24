import { AI_INTERVIEW_LIMITS, contextFields, type AiInterviewContextMode } from "@/shared/blocks/ai-interview/schema";
import type { AiInterviewSessionView } from "@/shared/api/ai";

// Pure helpers behind the interview block, kept apart from React so they can be
// unit tested without a DOM.

/** Where learners add their OpenRouter key. */
export const AI_SETTINGS_HREF = "/settings/profile#ai-interviews";

export type InterviewStage = "unavailable" | "no-key" | "intro" | "chat" | "feedback";

/** Which screen the block shows for the key state and the latest session. */
export function interviewStage(input: { configured: boolean; hasKey: boolean; session: AiInterviewSessionView | null }): InterviewStage {
  const { configured, hasKey, session } = input;
  if (session?.status === "FINISHED" && session.feedback) return "feedback";
  if (session?.status === "ACTIVE") return "chat";
  if (!configured) return "unavailable";
  if (!hasKey) return "no-key";
  return "intro";
}

export function turnCounter(session: Pick<AiInterviewSessionView, "turnCount" | "maxTurns">): string {
  const done = Math.min(session.turnCount, session.maxTurns);
  return `${done} of ${session.maxTurns} answers`;
}

export type AnswerCheck = { length: number; remaining: number; tooLong: boolean; empty: boolean; canSend: boolean };

export function checkAnswer(text: string, max: number = AI_INTERVIEW_LIMITS.answerMaxChars): AnswerCheck {
  const length = text.length;
  const empty = text.trim().length === 0;
  const tooLong = length > max;
  return { length, remaining: max - length, tooLong, empty, canSend: !empty && !tooLong };
}

export type ContextCheck = { length: number; remaining: number; tooShort: boolean; tooLong: boolean; ok: boolean };

/** Length check for one pasted box against its own limits. */
export function checkContext(text: string, min: number = AI_INTERVIEW_LIMITS.contextMinChars, max: number = AI_INTERVIEW_LIMITS.contextMaxChars): ContextCheck {
  const length = text.trim().length;
  const tooShort = length < min;
  const tooLong = text.length > max;
  return { length, remaining: max - text.length, tooShort, tooLong, ok: !tooShort && !tooLong };
}

/** What the learner has typed in each context box, by wire field. */
export type ContextDrafts = { context: string; contextWork: string };

/** True once every box the block asks for is filled within its limits. */
export function contextReady(mode: AiInterviewContextMode, drafts: ContextDrafts): boolean {
  return contextFields(mode).every((box) => checkContext(drafts[box.field], box.min, box.max).ok);
}

/** A message that is safe to show: API errors already carry plain text, anything else gets a generic line. */
export function friendlyError(error: unknown): string {
  if (error instanceof Error && error.message && !/^Failed to fetch$|^NetworkError/i.test(error.message)) return error.message;
  return "We could not reach the server. Check your connection and try again.";
}
