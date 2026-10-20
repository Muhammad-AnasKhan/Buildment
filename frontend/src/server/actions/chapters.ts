"use server";

import { revalidatePath } from "next/cache";
import type { ChapterIdResult, ChapterSettingsInput, SavedAtResult } from "@/shared/api/teach";
import { teachCall } from "./teach-call";

// Mentor-facing chapter mutations, forwarded to /api/v1/teach. The editor keeps
// its autosave/publish state machine on the client, so result shapes are stable.

export type ActionResult = { ok: true } | { ok: false; errors: string[] };
export type SavedResult = { ok: true; savedAt: string } | { ok: false; errors: string[] };

const chapterPath = (chapterId: string) => `/api/v1/teach/chapters/${encodeURIComponent(chapterId)}`;

export async function updateChapterSettings(input: { chapterId: string } & ChapterSettingsInput): Promise<SavedResult> {
  const { chapterId, ...settings } = input;
  const result = await teachCall<SavedAtResult>(`${chapterPath(chapterId)}/settings`, { method: "PATCH", json: settings });
  return result.ok ? { ok: true, savedAt: result.data.savedAt } : result;
}

export async function saveChapterDraft(input: { chapterId: string; source: string }): Promise<SavedResult> {
  const result = await teachCall<SavedAtResult>(`${chapterPath(input.chapterId)}/draft`, { method: "PUT", json: { source: input.source } });
  return result.ok ? { ok: true, savedAt: result.data.savedAt } : result;
}

/** Validate + sync blocks + snapshot on the API; failures come back as a list of reasons. */
export async function publishChapter(input: { chapterId: string }): Promise<ActionResult> {
  const result = await teachCall<void>(`${chapterPath(input.chapterId)}/publish`, { method: "POST" });
  if (!result.ok) return result;
  revalidatePath("/courses/[courseSlug]/edit", "page");
  return { ok: true };
}

export async function createChapter(input: {
  courseId: string;
  moduleId?: string;
  title: string;
}): Promise<{ ok: true; chapterId: string } | { ok: false; errors: string[] }> {
  const result = await teachCall<ChapterIdResult>(`/api/v1/teach/courses/${encodeURIComponent(input.courseId)}/chapters`, {
    method: "POST",
    json: { moduleId: input.moduleId, title: input.title },
  });
  if (!result.ok) return { ok: false, errors: ["Title is required."] };
  revalidatePath("/courses/[courseSlug]/edit", "page");
  return { ok: true, chapterId: result.data.chapterId };
}

export async function moveChapter(input: { chapterId: string; direction: "up" | "down" }): Promise<ActionResult> {
  const result = await teachCall<void>(`${chapterPath(input.chapterId)}/move`, { method: "POST", json: { direction: input.direction } });
  if (!result.ok) return result;
  revalidatePath("/courses/[courseSlug]/edit", "page");
  return { ok: true };
}

/** Permanently deletes a chapter after the instructor confirms in the UI. */
export async function removeChapter(input: {
  chapterId: string;
  /** Required when the chapter already has learner progress or submissions. */
  confirmedWithProgress?: boolean;
}): Promise<ActionResult> {
  const result = await teachCall<void>(chapterPath(input.chapterId), {
    method: "DELETE",
    json: { confirmedWithProgress: input.confirmedWithProgress ?? false },
  });
  if (!result.ok) return result;
  revalidatePath("/courses/[courseSlug]/edit", "page");
  return { ok: true };
}
