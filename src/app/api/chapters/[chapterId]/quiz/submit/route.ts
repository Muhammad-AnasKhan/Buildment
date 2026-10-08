import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { requireBlockSubmissionAccess } from "@/server/enrollment/api-learn-access";
import { QuizPayloadSchema } from "@/blocks/quiz/schema";
import { blockRegistry } from "@/blocks/registry";
import { assertChapterUnlocked, ChapterLockedError } from "@/server/progress/gate";
import { bypassProgressGatingForEmail } from "@/server/dev/seed-access";
import { checkRateLimit } from "@/server/rate-limit";
import { recomputeChapterProgress, recordBlockStats } from "@/server/progress/compute";

const SubmitSchema = z.object({
  answers: z.array(z.object({
    blockId: z.string().min(1),
    selected: z.array(z.string()),
  })).min(1).max(100),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;
  const user = await getSessionUser();

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true, courseId: true, readerMode: true },
  });
  if (!chapter || chapter.readerMode !== "QUIZ") {
    return NextResponse.json({ error: "Quiz chapter not found" }, { status: 404 });
  }

  const access = await requireBlockSubmissionAccess(chapter.courseId, user);
  if (!access.ok) {
    return NextResponse.json(
      { error: access.error, code: access.code },
      { status: access.status }
    );
  }
  const { enrollment, user: verifiedUser } = access;

  if (!checkRateLimit(`quiz-submit:${verifiedUser.id}:${chapterId}`, { max: 10, windowMs: 60_000 })) {
    return NextResponse.json({ error: "Too many quiz submissions. Please wait a moment." }, { status: 429 });
  }

  try {
    await assertChapterUnlocked({
      courseId: chapter.courseId,
      enrollmentId: enrollment.id,
      chapterId,
      bypassLocking: bypassProgressGatingForEmail(verifiedUser.email ?? ""),
    });
  } catch (error) {
    if (error instanceof ChapterLockedError) {
      return NextResponse.json({ error: "This chapter is locked. Finish the previous chapter first." }, { status: 403 });
    }
    throw error;
  }

  const body = await request.json().catch(() => null);
  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid quiz answers" }, { status: 400 });

  const quizBlocks = await prisma.block.findMany({
    where: { chapterId, type: "QUIZ", archivedAt: null },
    orderBy: { order: "asc" },
    select: { id: true, config: true },
  });
  if (quizBlocks.length === 0) return NextResponse.json({ error: "This chapter has no quiz questions" }, { status: 400 });

  const submittedIds = parsed.data.answers.map((answer) => answer.blockId);
  const expectedIds = new Set(quizBlocks.map((block) => block.id));
  if (new Set(submittedIds).size !== submittedIds.length || submittedIds.length !== expectedIds.size || submittedIds.some((id) => !expectedIds.has(id))) {
    return NextResponse.json({ error: "Submit every quiz question exactly once" }, { status: 400 });
  }
  const answersByBlock = new Map(parsed.data.answers.map((answer) => [answer.blockId, answer.selected]));
  const prepared = quizBlocks.map((block) => {
    const config = blockRegistry.QUIZ.schema.parse(block.config);
    const normalized = [...new Set(answersByBlock.get(block.id) ?? [])];
    const validOptionIds = new Set(config.options.map((option) => option.id));
    if (normalized.some((optionId) => !validOptionIds.has(optionId))) return null;
    return { block, config, normalized };
  });
  if (prepared.some((item) => item === null)) {
    return NextResponse.json({ error: "One or more selected options are invalid" }, { status: 400 });
  }

  const results = await prisma.$transaction(async (tx) => {
    const grades: { blockId: string; score: number | null; maxScore: number | null; isCorrect: boolean | null }[] = [];

    for (const item of prepared) {
      if (!item) continue;
      const { block, config, normalized } = item;

      const previous = await tx.response.findFirst({
        where: { blockId: block.id, userId: verifiedUser.id, status: { not: "DRAFT" } },
        orderBy: { attempt: "desc" },
      });
      if (previous && (previous.isCorrect === true || !config.allowRetry)) {
        grades.push({ blockId: block.id, score: previous.score, maxScore: previous.maxScore, isCorrect: previous.isCorrect });
        continue;
      }

      const payload = QuizPayloadSchema.parse({ selected: normalized });
      const graded = blockRegistry.QUIZ.grade(config, payload);
      const previousAttempts = await tx.response.count({
        where: { blockId: block.id, userId: verifiedUser.id },
      });
      await tx.response.create({
        data: {
          blockId: block.id,
          userId: verifiedUser.id,
          enrollmentId: enrollment.id,
          attempt: previousAttempts + 1,
          status: graded.status,
          payload: { selected: normalized },
          score: graded.score,
          maxScore: graded.maxScore,
          isCorrect: graded.isCorrect,
        },
      });
      await recordBlockStats(tx, { blockId: block.id, status: graded.status, isCorrect: graded.isCorrect });
      grades.push({ blockId: block.id, score: graded.score, maxScore: graded.maxScore, isCorrect: graded.isCorrect });
    }

    await recomputeChapterProgress(tx, enrollment.id, chapterId);
    return grades;
  });

  return NextResponse.json({
    score: results.reduce((sum, item) => sum + (item.score ?? 0), 0),
    maxScore: results.reduce((sum, item) => sum + (item.maxScore ?? 0), 0),
    questions: results.length,
  });
}
