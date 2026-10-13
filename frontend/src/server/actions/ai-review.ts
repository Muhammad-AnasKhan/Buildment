"use server";

import { z } from "zod";
import { OpenQuestionConfigSchema, OpenQuestionPayloadSchema } from "@/blocks/open-question/schema";
import { requireMentorOfCourse } from "@/server/auth/guards";
import { generateReviewDraft, type AiReviewDraft } from "@/server/ai/review-draft";
import { prisma } from "@/server/db";

const inputSchema = z.object({ responseId: z.string().min(1) });

export type AiReviewActionResult =
  | { ok: true; draft: AiReviewDraft; model: string }
  | { ok: false; error: string };

export async function generateAiReviewDraft(input: {
  responseId: string;
}): Promise<AiReviewActionResult> {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Submission not found." };

  const response = await prisma.response.findUnique({
    where: { id: parsed.data.responseId },
    include: {
      block: {
        include: {
          chapter: { select: { title: true, course: { select: { id: true, title: true } } } },
        },
      },
    },
  });

  if (!response) return { ok: false, error: "Submission not found." };
  await requireMentorOfCourse(response.block.chapter.course.id);

  if (response.status !== "PENDING_REVIEW") {
    return { ok: false, error: "This submission has already been reviewed." };
  }
  if (response.block.type !== "OPEN_QUESTION") {
    return { ok: false, error: "AI drafting currently supports open-question responses." };
  }

  const config = OpenQuestionConfigSchema.safeParse(response.block.config);
  const payload = OpenQuestionPayloadSchema.safeParse(response.payload);
  if (!config.success || !payload.success) {
    return { ok: false, error: "This submission could not be prepared for AI review." };
  }

  const priorResponses = await prisma.response.findMany({
    where: {
      blockId: response.blockId,
      userId: response.userId,
      id: { not: response.id },
      review: { isNot: null },
    },
    orderBy: { attempt: "desc" },
    take: 3,
    select: { review: { select: { feedback: true } } },
  });

  const answerParts = [payload.data.text.trim()];
  if (payload.data.url?.trim()) answerParts.push(`Submitted URL (not fetched): ${payload.data.url.trim()}`);

  try {
    const result = await generateReviewDraft({
      courseTitle: response.block.chapter.course.title,
      chapterTitle: response.block.chapter.title,
      prompt: config.data.prompt,
      rubric: config.data.rubric,
      sampleAnswer: config.data.sampleAnswer,
      answer: answerParts.filter(Boolean).join("\n\n"),
      previousFeedback: priorResponses.flatMap((item) =>
        item.review?.feedback ? [item.review.feedback] : [],
      ),
      maxScore: response.block.points,
    });

    return {
      ok: true,
      model: result.model,
      draft: {
        ...result.draft,
        suggestedScore: Math.min(result.draft.suggestedScore, response.block.points),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const safeMessage =
      message.includes("OPENROUTER_API_KEY") ||
      message.startsWith("OpenRouter could not generate") ||
      message.startsWith("OpenRouter returned an unreadable")
        ? message
        : "AI drafting is temporarily unavailable. Try again in a moment.";
    return { ok: false, error: safeMessage };
  }
}
