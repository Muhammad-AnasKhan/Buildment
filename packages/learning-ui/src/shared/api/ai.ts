// GENERATED from server/src/shared — do not edit here. Run `pnpm sync-shared` in server/.
import type { AiInterviewFeedback, AiInterviewTurn } from "../blocks/ai-interview/schema";

// Wire contract for the learner's own AI key (GET/PUT/PATCH/DELETE
// /api/v1/learner/ai-credential). The key itself is write-only: no response
// ever carries it, only its last four characters.

export type AiCredentialStatus = {
  /** False when the server has no AI_KEY_ENCRYPTION_KEY, so keys cannot be stored. */
  configured: boolean;
  hasKey: boolean;
  provider: "OPENROUTER";
  lastFour: string | null;
  /** The learner's chosen model, or null for the server default. */
  model: string | null;
  defaultModel: string;
  updatedAt: string | null;
  lastUsedAt: string | null;
};

export type AiCredentialSaveInput = { apiKey: string; model?: string | null };
export type AiCredentialModelInput = { model: string | null };

export const AI_MODEL_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{1,119}$/;

// ---- AI interview sessions ---------------------------------------------------
// POST /api/v1/blocks/:blockId/ai-interview/{start,answer,finish,abandon}

export type AiInterviewSessionStatus = "ACTIVE" | "FINISHED" | "ABANDONED";

export type AiInterviewSessionView = {
  id: string;
  status: AiInterviewSessionStatus;
  /** What the learner pasted when starting; null when the block asks for none. */
  context: string | null;
  transcript: AiInterviewTurn[];
  /** Answers given so far. */
  turnCount: number;
  maxTurns: number;
  /** True once the last allowed answer is in: the only step left is to finish. */
  limitReached: boolean;
  /** At least one answer is in, so feedback can be requested. */
  canFinish: boolean;
  feedback: AiInterviewFeedback | null;
  startedAt: string;
  finishedAt: string | null;
};

/** Returned by start, answer, finish and abandon. */
export type AiInterviewSessionResult = { session: AiInterviewSessionView };

export type AiInterviewStartInput = { context?: string | null };
export type AiInterviewAnswerInput = { sessionId: string; answer: string };
export type AiInterviewSessionInput = { sessionId: string };

/** What a block needs to draw itself: key and server readiness, and the latest session. */
export type AiInterviewInitialState = {
  /** False when the server has no AI_KEY_ENCRYPTION_KEY. */
  configured: boolean;
  hasKey: boolean;
  /** The active session, else the latest finished one, else null. */
  session: AiInterviewSessionView | null;
};
