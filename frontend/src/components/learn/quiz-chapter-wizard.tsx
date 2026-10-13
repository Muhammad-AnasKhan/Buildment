import { prisma } from "@/server/db";
import { QuizComponent } from "@/blocks/quiz/Component";
import { QuizChapterSessionClient } from "./quiz-chapter-session-client";
import { getSessionUser } from "@/server/auth/guards";
import { QuizConfigSchema } from "@/blocks/quiz/schema";
import type { QuizBlockGrade } from "./quiz-session-context";

export async function QuizChapterWizard({
  chapterId,
  chapterTitle,
}: {
  chapterId: string;
  chapterTitle: string;
}) {
  const user = await getSessionUser();
  if (!user) return null;
  const blocks = await prisma.block.findMany({
    where: { chapterId, archivedAt: null, type: "QUIZ" },
    orderBy: { order: "asc" },
    select: { id: true, type: true, config: true },
  });

  const steps = blocks;
  if (steps.length === 0) return null;

  const quizBlockIds = steps.map((block) => block.id);
  const latestResponses = quizBlockIds.length
    ? await prisma.response.findMany({
        where: { blockId: { in: quizBlockIds }, userId: user.id, status: { not: "DRAFT" } },
        orderBy: { attempt: "desc" },
      })
    : [];

  const latestByBlock = new Map<string, (typeof latestResponses)[number]>();
  for (const response of latestResponses) {
    if (!latestByBlock.has(response.blockId)) latestByBlock.set(response.blockId, response);
  }
  const initialAnswers = Object.fromEntries(
    quizBlockIds.map((blockId) => {
      const payload = latestByBlock.get(blockId)?.payload as { selected?: unknown } | undefined;
      return [
        blockId,
        Array.isArray(payload?.selected)
          ? payload.selected.filter((item): item is string => typeof item === "string")
          : [],
      ] as const;
    })
  );

  const initialBlockGrades: Record<string, QuizBlockGrade> = {};
  for (const block of steps) {
    const response = latestByBlock.get(block.id);
    if (!response) continue;
    const parsed = QuizConfigSchema.safeParse(block.config);
    const payload = response.payload as { selected?: unknown } | undefined;
    const selected = Array.isArray(payload?.selected)
      ? payload.selected.filter((item): item is string => typeof item === "string")
      : [];
    initialBlockGrades[block.id] = {
      selected,
      isCorrect: response.isCorrect,
      explanation: parsed.success ? parsed.data.explanation : undefined,
    };
  }

  const allAttempted =
    quizBlockIds.length > 0 && quizBlockIds.every((blockId) => latestByBlock.has(blockId));
  const score = quizBlockIds.reduce((total, id) => total + (latestByBlock.get(id)?.score ?? 0), 0);
  const maxScore = quizBlockIds.reduce(
    (total, id) => total + (latestByBlock.get(id)?.maxScore ?? 0),
    0
  );
  const initialScoreSummary = allAttempted
    ? { score, maxScore, questions: quizBlockIds.length }
    : null;
  const draftStoragePrefix = `buildment:quiz-draft:${user.id}:${chapterId}`;

  return (
    <QuizChapterSessionClient
      chapterId={chapterId}
      chapterTitle={chapterTitle}
      quizBlockIds={quizBlockIds}
      draftStoragePrefix={draftStoragePrefix}
      initialAnswers={initialAnswers}
      initialScoreSummary={initialScoreSummary}
      initialBlockGrades={initialBlockGrades}
    >
      {steps.map((block) => (
        <QuizComponent
          key={block.id}
          id={block.id}
          presentation="wizard"
          draftStoragePrefix={draftStoragePrefix}
        />
      ))}
    </QuizChapterSessionClient>
  );
}
