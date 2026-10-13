"use server";

import { teachCall } from "./teach-call";

// Mentor review of human-graded submissions (docs/05-review-queue.mdx); the
// verdict, score capping and progress recompute happen on the API.

export type ReviewActionResult = { ok: true } | { ok: false; errors: string[] };

export async function submitReview(input: {
  responseId: string;
  verdict: "APPROVED" | "NEEDS_REVISION";
  feedback: string;
  score?: number;
}): Promise<ReviewActionResult> {
  const { responseId, ...review } = input;
  const result = await teachCall<void>(`/api/v1/teach/review/${encodeURIComponent(responseId)}`, { method: "POST", json: review });
  return result.ok ? { ok: true } : result;
}
