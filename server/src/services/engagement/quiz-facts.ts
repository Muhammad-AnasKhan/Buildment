import type { BlockType, Prisma, PrismaClient } from "../../generated/prisma/index.js";
import type { QuizSubmittedFacts } from "../../shared/api/engagement.js";
import { checkpointSatisfied } from "../progress/rules.js";

// The facts of a quiz chapter submission, shared by engagement events (the mascot's reaction) and
// XP (awarded inside the transaction that graded the quiz, so it takes any Prisma client).

type Db = PrismaClient | Prisma.TransactionClient;

type QuizBlockAttempt = {
  type: BlockType;
  config: unknown;
  latest: { attempt: number; status: string; isCorrect: boolean | null; score: number | null; maxScore: number | null } | null;
};

/**
 * The facts of the learner's latest quiz submission: the attempt number, whether every question is
 * satisfied (the rule that completes the chapter) and the score as a percentage. Pure for tests.
 */
export function summarizeQuizAttempt(blocks: QuizBlockAttempt[]): QuizSubmittedFacts {
  let score = 0;
  let maxScore = 0;
  let attempt = 0;
  for (const { latest } of blocks) {
    if (!latest) continue;
    attempt = Math.max(attempt, latest.attempt);
    score += latest.score ?? 0;
    maxScore += latest.maxScore ?? 0;
  }
  const passed =
    blocks.length > 0 &&
    blocks.every(
      ({ type, config, latest }) =>
        latest !== null && checkpointSatisfied({ type, config, status: latest.status, isCorrect: latest.isCorrect })
    );
  return { passed, attempt, score: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0 };
}

/** The latest submission facts for one quiz chapter, or null before the first submission. */
export async function latestQuizAttempt(db: Db, userId: string, chapterId: string): Promise<QuizSubmittedFacts | null> {
  const blocks = await db.block.findMany({
    where: { chapterId, type: "QUIZ", archivedAt: null },
    select: { id: true, type: true, config: true },
  });
  if (blocks.length === 0) return null;

  const responses = await db.response.findMany({
    where: { userId, blockId: { in: blocks.map((block) => block.id) }, status: { not: "DRAFT" } },
    orderBy: { attempt: "desc" },
    select: { blockId: true, attempt: true, status: true, isCorrect: true, score: true, maxScore: true },
  });
  if (responses.length === 0) return null;

  const latest = new Map<string, (typeof responses)[number]>();
  for (const response of responses) if (!latest.has(response.blockId)) latest.set(response.blockId, response);
  return summarizeQuizAttempt(blocks.map((block) => ({ ...block, latest: latest.get(block.id) ?? null })));
}
