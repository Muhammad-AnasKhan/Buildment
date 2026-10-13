import { fetchBlockState } from "@/blocks/block-state";
import type { SanitizedQuizConfig } from "@buildment/shared/blocks/quiz/schema";
import { QuizClient } from "./QuizClient";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

export type QuizOptionInput = string | { id?: string; label: string };

export async function QuizComponent({
  id,
  prompt,
  question,
  quizType = "single",
  options,
  correctOptionIds,
  explanation,
  allowRetry = true,
  presentation = "standalone",
  draftStoragePrefix,
}: {
  id?: string;
  prompt?: string;
  question?: string;
  quizType?: "single" | "multiple" | "true-false";
  options?: QuizOptionInput[];
  correctOptionIds?: string[];
  explanation?: string;
  allowRetry?: boolean;
  presentation?: "standalone" | "wizard";
  draftStoragePrefix?: string;
}) {
  const resolvedPrompt = prompt || question;

  // Direct prop authoring fallback
  if (resolvedPrompt && Array.isArray(options) && options.length >= 2) {
    const normalizedOptions = options.map((opt, i) =>
      typeof opt === "string"
        ? { id: `opt-${i}`, label: opt }
        : { id: opt.id || `opt-${i}`, label: opt.label || "" }
    );

    const clientConfig: SanitizedQuizConfig = {
      quizType,
      prompt: resolvedPrompt,
      options: normalizedOptions,
      allowRetry,
      explanation,
    };

    return (
      <QuizClient
        id={id || "preview-quiz"}
        config={clientConfig}
        initialState={null}
        presentation={presentation}
        draftStorageKey={draftStoragePrefix && id ? `${draftStoragePrefix}:${id}` : undefined}
        correctOptionIds={correctOptionIds}
      />
    );
  }

  if (id) {
    const state = await fetchBlockState(id, "QUIZ");
    if (state) {
      return (
        <QuizClient
          id={id}
          config={state.config}
          initialState={state.initialState}
          presentation={presentation}
          draftStorageKey={draftStoragePrefix ? `${draftStoragePrefix}:${id}` : undefined}
        />
      );
    }
  }

  // Graceful pending state when block row or config is incomplete
  if (id || resolvedPrompt) {
    return (
      <PendingBlockCard
        typeLabel="Interactive Quiz"
        title={resolvedPrompt || "Knowledge check in preparation"}
        description="Multiple-choice checkpoint questions are being prepared for this section."
        blockId={id}
      />
    );
  }

  return null;
}
