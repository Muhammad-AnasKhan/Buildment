import { prisma } from "@/server/db";
import { QuizComponent } from "@/blocks/quiz/Component";
import { OpenQuestionComponent } from "@/blocks/open-question/Component";
import { PredictComponent } from "@/blocks/predict/Component";
import { QuizChapterSessionClient } from "./quiz-chapter-session-client";

const WIZARD_TYPES = new Set(["QUIZ", "OPEN_QUESTION", "PREDICT"]);

export async function QuizChapterWizard({ chapterId }: { chapterId: string }) {
  const blocks = await prisma.block.findMany({
    where: { chapterId, archivedAt: null },
    orderBy: { order: "asc" },
    select: { id: true, type: true },
  });

  const steps = blocks.filter((b) => WIZARD_TYPES.has(b.type));
  if (steps.length === 0) return null;

  return (
    <QuizChapterSessionClient>
        {steps.map((block) => {
          if (block.type === "QUIZ") {
            return <QuizComponent key={block.id} id={block.id} presentation="wizard" />;
          }
          if (block.type === "OPEN_QUESTION") {
            return <OpenQuestionComponent key={block.id} id={block.id} />;
          }
          return <PredictComponent key={block.id} id={block.id} />;
        })}
    </QuizChapterSessionClient>
  );
}
