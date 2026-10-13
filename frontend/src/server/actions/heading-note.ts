"use server";

import { ApiError } from "@/lib/api-client";
import { serverApiFetch } from "@/lib/api-server";

export async function saveHeadingNote(raw: { chapterId: string; headingId: string; body: string }) {
  try {
    await serverApiFetch(
      `/api/v1/chapters/${encodeURIComponent(raw.chapterId)}/notes/${encodeURIComponent(raw.headingId)}`,
      { method: "PUT", json: { body: raw.body } }
    );
    return { ok: true as const };
  } catch (error) {
    if (error instanceof ApiError) return { ok: false as const, error: error.message };
    throw error;
  }
}
