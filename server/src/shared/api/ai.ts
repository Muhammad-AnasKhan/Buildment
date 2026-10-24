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
