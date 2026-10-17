import type { QuizChapterState } from "../../shared/api/blocks.js";
import { QuizConfigSchema } from "../../shared/blocks/quiz/schema.js";
import { prisma } from "../../db/prisma.js";

/** Initial state for a quiz-mode chapter's wizard: last answers, grades and the score once every question is attempted. */
export async function loadQuizChapterState(chapterId: string, userId: string): Promise<QuizChapterState> {
  const blocks = await prisma.block.findMany({
    where: { chapterId, archivedAt: null, type: { in: ["QUIZ", "OPEN_QUESTION", "PREDICT", "CODE"] } },
    orderBy: { order: "asc" },
    select: { id: true, type: true, config: true },
  });
  const steps: QuizChapterState["steps"] = blocks.map(block => ({ id: block.id, type: block.type as QuizChapterState["steps"][number]["type"] }));
  const quizBlocks = blocks.filter(block => block.type === "QUIZ");
  const blockIds = quizBlocks.map((block) => block.id);
  if (blockIds.length === 0) return { steps, blockIds, initialAnswers: {}, initialBlockGrades: {}, initialScoreSummary: null };

  const responses = await prisma.response.findMany({
    where: { blockId: { in: blockIds }, userId, status: { not: "DRAFT" } },
    orderBy: { attempt: "desc" },
  });
  const latestByBlock = new Map<string, (typeof responses)[number]>();
  for (const response of responses) {
    if (!latestByBlock.has(response.blockId)) latestByBlock.set(response.blockId, response);
  }
  const selectedFor = (blockId: string) => {
    const payload = latestByBlock.get(blockId)?.payload as { selected?: unknown } | undefined;
    return Array.isArray(payload?.selected) ? payload.selected.filter((item): item is string => typeof item === "string") : [];
  };

  const initialBlockGrades: QuizChapterState["initialBlockGrades"] = {};
  for (const block of quizBlocks) {
    const response = latestByBlock.get(block.id);
    if (!response) continue;
    const parsed = QuizConfigSchema.safeParse(block.config);
    initialBlockGrades[block.id] = {
      selected: selectedFor(block.id),
      isCorrect: response.isCorrect,
      explanation: parsed.success ? parsed.data.explanation : undefined,
    };
  }

  const allAttempted = blockIds.every((blockId) => latestByBlock.has(blockId));
  return {
    steps,
    blockIds,
    initialAnswers: Object.fromEntries(blockIds.map((blockId) => [blockId, selectedFor(blockId)])),
    initialBlockGrades,
    initialScoreSummary: allAttempted
      ? {
          score: blockIds.reduce((total, id) => total + (latestByBlock.get(id)?.score ?? 0), 0),
          maxScore: blockIds.reduce((total, id) => total + (latestByBlock.get(id)?.maxScore ?? 0), 0),
          questions: blockIds.length,
        }
      : null,
  };
}
