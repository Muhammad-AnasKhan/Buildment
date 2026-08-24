"use server";

import { z } from "zod";
import { prisma } from "@/server/db";
import { requireMentorOfCourse } from "@/server/auth/guards";
import {
  adjustEnrollmentPendingReviews,
  recomputeChapterProgress,
  resolvePendingBlockReview,
} from "@/server/progress/compute";

// Mentor review of human-graded submissions (docs/05-review-queue.mdx).
// The needs-revision loop never reverts chapter completion — completion tracks
// submission, review tracks quality — so the only progress write here is a
// recompute to fold the awarded score into the denormalized rollups.

const submitReviewInput = z.object({
  responseId: z.string().min(1),
  verdict: z.enum(["APPROVED", "NEEDS_REVISION"]),
  feedback: z.string().min(1, "Feedback is required — the mentee sees this verbatim.").max(5000),
  score: z.coerce.number().int().min(0).optional(),
});

export type ReviewActionResult = { ok: true } | { ok: false; errors: string[] };

export async function submitReview(input: {
  responseId: string;
  verdict: "APPROVED" | "NEEDS_REVISION";
  feedback: string;
  score?: number;
}): Promise<ReviewActionResult> {
  const parsed = submitReviewInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((issue) => issue.message) };
  }

  const response = await prisma.response.findUnique({
    where: { id: parsed.data.responseId },
    include: {
      block: {
        select: {
          id: true,
          points: true,
          chapter: { select: { id: true, courseId: true } },
        },
      },
    },
  });
  if (!response) return { ok: false, errors: ["Submission not found."] };
  if (response.status !== "PENDING_REVIEW") {
    return { ok: false, errors: ["This submission has already been reviewed."] };
  }

  const user = await requireMentorOfCourse(response.block.chapter.courseId);

  const maxScore = response.block.points;
  const score =
    parsed.data.score !== undefined ? Math.min(parsed.data.score, maxScore) : null;

  await prisma.$transaction(async (tx) => {
    await tx.response.update({
      where: { id: response.id },
      data: {
        status: parsed.data.verdict === "APPROVED" ? "REVIEWED" : "NEEDS_REVISION",
        score,
        maxScore,
      },
    });
    await tx.review.create({
      data: {
        responseId: response.id,
        reviewerId: user.id,
        feedback: parsed.data.feedback,
        verdict: parsed.data.verdict,
        score,
      },
    });
    await resolvePendingBlockReview(tx, response.blockId);
    await adjustEnrollmentPendingReviews(tx, response.enrollmentId, -1);
    await recomputeChapterProgress(tx, response.enrollmentId, response.block.chapter.id);
  });

  return { ok: true };
}
