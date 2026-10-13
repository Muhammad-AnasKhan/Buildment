"use server";

import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";

export type ProgressActionResult = { ok: true } | { ok: false; error: string };

async function chapterCall(path: string, init: { method: "POST" | "PUT"; json?: unknown }): Promise<ProgressActionResult> {
  try {
    await serverApiFetch(path, init);
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false, error: error.message };
    throw error;
  }
}

export async function markChapterComplete(input: { chapterId: string }): Promise<ProgressActionResult> {
  return chapterCall(`/api/v1/chapters/${encodeURIComponent(input.chapterId)}/complete`, { method: "POST" });
}

export async function saveChecklistItem(input: {
  chapterId: string;
  itemId: string;
  checked: boolean;
}): Promise<ProgressActionResult> {
  return chapterCall(
    `/api/v1/chapters/${encodeURIComponent(input.chapterId)}/checklist/${encodeURIComponent(input.itemId)}`,
    { method: "PUT", json: { checked: input.checked } }
  );
}

/** Mentor-only: rebuild chapter + enrollment rollups from Response rows. */
export async function repairEnrollmentProgressAction(input: { enrollmentId: string }): Promise<ProgressActionResult> {
  return chapterCall(`/api/v1/teach/enrollments/${encodeURIComponent(input.enrollmentId)}/repair-progress`, { method: "POST" });
}
