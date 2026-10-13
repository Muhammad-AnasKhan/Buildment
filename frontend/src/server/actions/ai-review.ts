"use server";

import type { AiReviewDraft, AiReviewDraftResult } from "@buildment/shared/api/teach";
import { teachCall } from "./teach-call";

export type AiReviewActionResult =
  | { ok: true; draft: AiReviewDraft; model: string }
  | { ok: false; error: string };

/** Advisory draft from the API's OpenRouter integration; the mentor still edits and submits. */
export async function generateAiReviewDraft(input: { responseId: string }): Promise<AiReviewActionResult> {
  const result = await teachCall<AiReviewDraftResult>(`/api/v1/teach/review/${encodeURIComponent(input.responseId)}/ai-draft`, { method: "POST" });
  if (!result.ok) return { ok: false, error: result.errors.join(" ") };
  return { ok: true, draft: result.data.draft, model: result.data.model };
}
