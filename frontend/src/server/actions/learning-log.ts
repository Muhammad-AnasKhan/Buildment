"use server";

import type { LearningLogSaveResult as SaveResponse } from "@buildment/shared/api/chapters";
import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";

export type LearningLogSaveResult = { ok: true; savedAt: string } | { ok: false; error: string };

export async function saveLearningLogAnswers(input: {
  chapterId: string;
  answers: Record<string, string>;
}): Promise<LearningLogSaveResult> {
  try {
    const { savedAt } = await serverApiFetch<SaveResponse>(
      `/api/v1/chapters/${encodeURIComponent(input.chapterId)}/learning-log`,
      { method: "PUT", json: { answers: input.answers } }
    );
    return { ok: true, savedAt };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, error: error.message };
    throw error;
  }
}
