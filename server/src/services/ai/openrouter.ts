import { z } from "zod";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/errors.js";

// Calls OpenRouter with a learner's own key. Every failure becomes an AiError
// with a stable code and a message written for the learner. Messages never
// include the key, the request body or the provider's raw reply, and no
// error carries a `cause`, so nothing secret can reach a response or a log.

export const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
export const DEFAULT_INTERVIEW_MODEL = "google/gemini-2.5-flash";

export function defaultInterviewModel(): string {
  return env.OPENROUTER_INTERVIEW_MODEL ?? DEFAULT_INTERVIEW_MODEL;
}

export type AiErrorCode =
  | "AI_NOT_CONFIGURED"
  | "AI_KEY_REQUIRED"
  | "AI_KEY_INVALID"
  | "AI_OUT_OF_CREDIT"
  | "AI_RATE_LIMITED"
  | "AI_PROVIDER_TIMEOUT"
  | "AI_PROVIDER_ERROR"
  | "AI_MODEL_UNAVAILABLE";

const AI_ERRORS: Record<AiErrorCode, { status: number; message: string }> = {
  AI_NOT_CONFIGURED: { status: 503, message: "AI interviews are not set up on this server." },
  AI_KEY_REQUIRED: { status: 409, message: "Add your OpenRouter key in settings to start an AI interview." },
  AI_KEY_INVALID: { status: 422, message: "OpenRouter did not accept this key. Check that you copied the whole key, or create a new one." },
  AI_OUT_OF_CREDIT: { status: 402, message: "Your OpenRouter key is out of credit. Add credit on openrouter.ai or pick a free model." },
  AI_RATE_LIMITED: { status: 429, message: "OpenRouter is rate limiting your key. Wait a minute and try again." },
  AI_PROVIDER_TIMEOUT: { status: 504, message: "OpenRouter took too long to answer. Please try again." },
  AI_PROVIDER_ERROR: { status: 502, message: "OpenRouter could not answer right now. Please try again in a moment." },
  AI_MODEL_UNAVAILABLE: { status: 422, message: "OpenRouter could not use the chosen model. Check the model id in settings." },
};

export class AiError extends AppError {
  constructor(code: AiErrorCode, message = AI_ERRORS[code].message) {
    super(message, AI_ERRORS[code].status, code);
  }
}

type FetchImpl = typeof fetch;

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type ChatRequest = {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  maxTokens: number;
  temperature?: number;
  responseFormat?: { type: "json_schema"; json_schema: unknown };
  timeoutMs?: number;
  fetchImpl?: FetchImpl;
};

const chatResponseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string().nullable() }) })).min(1),
});

const keyResponseSchema = z.object({
  data: z.object({
    limit_remaining: z.number().nullable().optional(),
    is_free_tier: z.boolean().optional(),
  }),
});

function headers(apiKey: string): Record<string, string> {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": env.APP_URL,
    "X-OpenRouter-Title": "buildment",
  };
}

/** Map an HTTP status from OpenRouter onto one of our codes. */
export function errorForStatus(status: number): AiError {
  if (status === 401 || status === 403) return new AiError("AI_KEY_INVALID");
  if (status === 402) return new AiError("AI_OUT_OF_CREDIT");
  if (status === 429) return new AiError("AI_RATE_LIMITED");
  if (status === 400 || status === 404) return new AiError("AI_MODEL_UNAVAILABLE");
  if (status === 408 || status === 504) return new AiError("AI_PROVIDER_TIMEOUT");
  return new AiError("AI_PROVIDER_ERROR");
}

function isTimeout(error: unknown): boolean {
  return error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
}

async function send(fetchImpl: FetchImpl, url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  try {
    return await fetchImpl(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    if (isTimeout(error)) throw new AiError("AI_PROVIDER_TIMEOUT");
    throw new AiError("AI_PROVIDER_ERROR");
  }
}

const RETRYABLE: ReadonlySet<AiErrorCode> = new Set(["AI_PROVIDER_TIMEOUT", "AI_PROVIDER_ERROR"]);

/** One chat completion. Timeouts and 5xx answers are retried once; key, credit and rate errors are not. */
export async function createChatCompletion(request: ChatRequest): Promise<string> {
  const fetchImpl = request.fetchImpl ?? fetch;
  const body = JSON.stringify({
    model: request.model,
    messages: request.messages,
    max_tokens: request.maxTokens,
    temperature: request.temperature ?? 0.4,
    ...(request.responseFormat
      ? { response_format: request.responseFormat, provider: { require_parameters: true } }
      : {}),
  });

  let lastError: AiError = new AiError("AI_PROVIDER_ERROR");
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await send(
        fetchImpl,
        `${OPENROUTER_BASE_URL}/chat/completions`,
        { method: "POST", headers: headers(request.apiKey), body },
        request.timeoutMs ?? 30_000
      );
      if (!response.ok) throw errorForStatus(response.status);
      const parsed = chatResponseSchema.safeParse(await response.json().catch(() => null));
      const content = parsed.success ? parsed.data.choices[0]!.message.content?.trim() : "";
      if (!content) throw new AiError("AI_PROVIDER_ERROR");
      return content;
    } catch (error) {
      if (!(error instanceof AiError)) throw new AiError("AI_PROVIDER_ERROR");
      lastError = error;
      if (!RETRYABLE.has(error.code as AiErrorCode)) throw error;
    }
  }
  throw lastError;
}

/**
 * One cheap request that checks a key without spending credit:
 * GET /api/v1/key returns the key's usage and limits.
 */
export async function checkOpenRouterKey(
  apiKey: string,
  options: { fetchImpl?: FetchImpl; timeoutMs?: number } = {}
): Promise<{ limitRemaining: number | null; isFreeTier: boolean }> {
  const response = await send(
    options.fetchImpl ?? fetch,
    `${OPENROUTER_BASE_URL}/key`,
    { method: "GET", headers: headers(apiKey) },
    options.timeoutMs ?? 10_000
  );
  if (!response.ok) throw errorForStatus(response.status);
  const parsed = keyResponseSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) throw new AiError("AI_PROVIDER_ERROR");
  const limitRemaining = parsed.data.data.limit_remaining ?? null;
  if (limitRemaining !== null && limitRemaining <= 0) throw new AiError("AI_OUT_OF_CREDIT");
  return { limitRemaining, isFreeTier: parsed.data.data.is_free_tier ?? false };
}
