import type { QuizChapterState } from "@/shared/api/blocks";
import { PredictComponent } from "@/blocks/predict/Component";
import { CodeExerciseComponent } from "@/blocks/code/Component";
import { OpenQuestionComponent } from "@/blocks/open-question/Component";
import { QuizComponent } from "@/blocks/quiz/Component";
import { getSessionUser } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { QuizChapterSessionClient } from "./quiz-chapter-session-client";

export async function QuizChapterWizard({ chapterId, chapterTitle }: { chapterId: string; chapterTitle: string }) {
  const user = await getSessionUser();
  if (!user) return null;

  const state = await serverApiFetch<QuizChapterState>(`/api/v1/chapters/${encodeURIComponent(chapterId)}/quiz`);
  if (state.steps.length === 0) return null;

  const draftStoragePrefix = `buildment:quiz-draft:${user.id}:${chapterId}`;

  return (
    <QuizChapterSessionClient
      chapterId={chapterId}
      chapterTitle={chapterTitle}
      quizBlockIds={state.blockIds}
      stepIds={state.steps.map(step => step.id)}
      individualActivityCount={state.steps.filter(step => step.type !== "QUIZ").length}
      draftStoragePrefix={draftStoragePrefix}
      initialAnswers={state.initialAnswers}
      initialScoreSummary={state.initialScoreSummary}
      initialBlockGrades={state.initialBlockGrades}
    >
      {state.steps.map(step => step.type === "OPEN_QUESTION"
        ? <OpenQuestionComponent key={step.id} id={step.id} />
        : step.type === "PREDICT" ? <PredictComponent key={step.id} id={step.id} />
        : step.type === "CODE" ? <CodeExerciseComponent key={step.id} id={step.id} />
        : <QuizComponent key={step.id} id={step.id} presentation="wizard" draftStoragePrefix={draftStoragePrefix} />
      )}
    </QuizChapterSessionClient>
  );
}
