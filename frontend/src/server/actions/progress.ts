"use server";

import { z } from "zod";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { repairEnrollmentProgress } from "@/server/progress/compute";
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

const enrollmentInput = z.object({ enrollmentId: z.string().min(1) });

/** Mentor-only: rebuild chapter + enrollment rollups from Response rows. Moves to the API with the instructor domain. */
export async function repairEnrollmentProgressAction(input: {
  enrollmentId: string;
}): Promise<ProgressActionResult> {
  const parsed = enrollmentInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid enrollment." };

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: parsed.data.enrollmentId },
    select: { id: true, courseId: true },
  });
  if (!enrollment) return { ok: false, error: "Enrollment not found." };

  await requireMentorOfCourse(enrollment.courseId);

  await prisma.$transaction(async (tx) => {
    await repairEnrollmentProgress(tx, enrollment.id, enrollment.courseId);
  });

  return { ok: true };
}
