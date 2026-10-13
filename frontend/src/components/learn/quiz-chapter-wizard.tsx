import type { QuizChapterState } from "@buildment/shared/api/blocks";
import { QuizComponent } from "@/blocks/quiz/Component";
import { getSessionUser } from "@/server/auth/guards";
import { serverApiFetch } from "@/lib/api-server";
import { QuizChapterSessionClient } from "./quiz-chapter-session-client";

export async function QuizChapterWizard({ chapterId, chapterTitle }: { chapterId: string; chapterTitle: string }) {
  const user = await getSessionUser();
  if (!user) return null;

  const state = await serverApiFetch<QuizChapterState>(`/api/v1/chapters/${encodeURIComponent(chapterId)}/quiz`);
  if (state.blockIds.length === 0) return null;

  const draftStoragePrefix = `buildment:quiz-draft:${user.id}:${chapterId}`;

  return (
    <QuizChapterSessionClient
      chapterId={chapterId}
      chapterTitle={chapterTitle}
      quizBlockIds={state.blockIds}
      draftStoragePrefix={draftStoragePrefix}
      initialAnswers={state.initialAnswers}
      initialScoreSummary={state.initialScoreSummary}
      initialBlockGrades={state.initialBlockGrades}
    >
      {state.blockIds.map((blockId) => (
        <QuizComponent key={blockId} id={blockId} presentation="wizard" draftStoragePrefix={draftStoragePrefix} />
      ))}
    </QuizChapterSessionClient>
  );
}
