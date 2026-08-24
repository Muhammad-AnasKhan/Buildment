import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { blockRegistry, isRegisteredBlockType } from "@/blocks/registry";
import { QuizPayloadSchema } from "@/blocks/quiz/schema";
import { PredictPayloadSchema } from "@/blocks/predict/schema";
import { OpenQuestionPayloadSchema } from "@/blocks/open-question/schema";
import { CodePayloadSchema } from "@/blocks/code/schema";
import { gradeCodeDetails } from "@/blocks/code/grade";
import {
  adjustEnrollmentPendingReviews,
  recomputeChapterProgress,
  recordBlockStats,
} from "@/server/progress/compute";
import type { GradeResult } from "@/blocks/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ blockId: string }> }) {
  const { blockId } = await params;

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const block = await prisma.block.findUnique({
    where: { id: blockId },
    include: { chapter: { select: { id: true, courseId: true } } },
  });
  if (!block || block.archivedAt) {
    return NextResponse.json({ error: "Block not found" }, { status: 404 });
  }
  if (!isRegisteredBlockType(block.type)) {
    return NextResponse.json({ error: `Block type ${block.type} has no grader yet` }, { status: 501 });
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { courseId_userId: { courseId: block.chapter.courseId, userId: user.id } },
  });
  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  let graded: GradeResult;
  let explanation: string | undefined;
  let solution: string | undefined;
  let failedTestName: string | undefined;
  let errorMessage: string | undefined;

  if (block.type === "QUIZ") {
    const config = blockRegistry.QUIZ.schema.parse(block.config);
    const payload = QuizPayloadSchema.parse(body);
    graded = blockRegistry.QUIZ.grade(config, payload);
    explanation = config.explanation;
  } else if (block.type === "PREDICT") {
    const config = blockRegistry.PREDICT.schema.parse(block.config);
    const payload = PredictPayloadSchema.parse(body);
    graded = blockRegistry.PREDICT.grade(config, payload);
    explanation = config.explanation;
  } else if (block.type === "CODE") {
    const config = blockRegistry.CODE.schema.parse(block.config);
    const payload = CodePayloadSchema.parse(body);
    graded = blockRegistry.CODE.grade(config, payload);
    explanation = config.explanation;
    const details = gradeCodeDetails(config, payload);
    failedTestName = details.failedTestName;
    errorMessage = details.errorMessage;
    if (graded.isCorrect && config.solution) {
      solution = config.solution;
    }
  } else {
    const config = blockRegistry.OPEN_QUESTION.schema.parse(block.config);
    const payload = OpenQuestionPayloadSchema.parse(body);
    graded = blockRegistry.OPEN_QUESTION.grade(config, payload);
  }

  const previousAttempts = await prisma.response.count({
    where: { blockId, userId: user.id },
  });

  const response = await prisma.$transaction(async (tx) => {
    const created = await tx.response.create({
      data: {
        blockId,
        userId: user.id,
        enrollmentId: enrollment.id,
        attempt: previousAttempts + 1,
        status: graded.status,
        payload: body,
        score: graded.score,
        maxScore: graded.maxScore,
        isCorrect: graded.isCorrect,
      },
    });
    await recordBlockStats(tx, {
      blockId,
      status: graded.status,
      isCorrect: graded.isCorrect,
    });
    if (graded.status === "PENDING_REVIEW") {
      await adjustEnrollmentPendingReviews(tx, enrollment.id, 1);
    }
    await recomputeChapterProgress(tx, enrollment.id, block.chapter.id);
    return created;
  });

  return NextResponse.json({
    score: response.score,
    maxScore: response.maxScore,
    isCorrect: response.isCorrect,
    status: response.status,
    explanation,
    solution,
    failedTestName,
    errorMessage,
  });
}
