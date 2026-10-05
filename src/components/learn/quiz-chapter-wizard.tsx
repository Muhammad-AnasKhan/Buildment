import { prisma } from "@/server/db";
import { QuizComponent } from "@/blocks/quiz/Component";
import { OpenQuestionComponent } from "@/blocks/open-question/Component";
import { PredictComponent } from "@/blocks/predict/Component";
import { QuizChapterSessionClient } from "./quiz-chapter-session-client";
import { getSessionUser } from "@/server/auth/guards";

const WIZARD_TYPES = new Set(["QUIZ", "OPEN_QUESTION", "PREDICT"]);

export async function QuizChapterWizard({ chapterId }: { chapterId: string }) {
  const user = await getSessionUser();
  if (!user) return null;
  const blocks = await prisma.block.findMany({
    where: { chapterId, archivedAt: null },
    orderBy: { order: "asc" },
    select: { id: true, type: true },
  });

  const steps = blocks.filter((b) => WIZARD_TYPES.has(b.type));
  if (steps.length === 0) return null;

  const quizBlockIds = steps.filter((block) => block.type === "QUIZ").map((block) => block.id);
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
  const initialAnswers = Object.fromEntries(quizBlockIds.map((blockId) => {
    const payload = latestByBlock.get(blockId)?.payload as { selected?: unknown } | undefined;
    return [blockId, Array.isArray(payload?.selected) ? payload.selected.filter((item): item is string => typeof item === "string") : []] as const;
  }));
  const allSubmitted = quizBlockIds.length > 0 && quizBlockIds.every((id) => latestByBlock.has(id));
  const initialQuizResult = allSubmitted
    ? {
        score: quizBlockIds.reduce((total, id) => total + (latestByBlock.get(id)?.score ?? 0), 0),
        maxScore: quizBlockIds.reduce((total, id) => total + (latestByBlock.get(id)?.maxScore ?? 0), 0),
        questions: quizBlockIds.length,
      }
    : null;
  const draftStoragePrefix = `buildment:quiz-draft:${user.id}:${chapterId}`;

  return (
    <QuizChapterSessionClient
      chapterId={chapterId}
      quizBlockIds={quizBlockIds}
      draftStoragePrefix={draftStoragePrefix}
      initialAnswers={initialAnswers}
      initialQuizResult={initialQuizResult}
    >
        {steps.map((block) => {
          if (block.type === "QUIZ") {
            return <QuizComponent key={block.id} id={block.id} presentation="wizard" draftStoragePrefix={draftStoragePrefix} />;
          }
          if (block.type === "OPEN_QUESTION") {
            return <OpenQuestionComponent key={block.id} id={block.id} />;
          }
          return <PredictComponent key={block.id} id={block.id} />;
        })}
    </QuizChapterSessionClient>
  );
}
