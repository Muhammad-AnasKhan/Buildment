import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { sanitizeBlockConfig } from "@/mdx/sanitize";
import { QuizConfigSchema, type SanitizedQuizConfig } from "./schema";
import { QuizClient, type QuizInitialState } from "./QuizClient";
import { getLatestBlockResponse } from "@/server/progress/latest-response";
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
    try {
      const block = await prisma.block.findUnique({ where: { id } });
      const parsed = block ? QuizConfigSchema.safeParse(block.config) : null;
      if (block && block.type === "QUIZ" && parsed?.success) {
        const sanitized = sanitizeBlockConfig<typeof parsed.data, SanitizedQuizConfig>(parsed.data);
        const user = await getSessionUser();
        let initialState: QuizInitialState | null = null;
        if (user) {
          const latest = await getLatestBlockResponse(id, user.id);
          if (latest) {
            const selected = Array.isArray((latest.payload as { selected?: unknown } | null)?.selected)
              ? ((latest.payload as { selected: string[] }).selected)
              : [];
            initialState = {
              selected,
              isCorrect: latest.isCorrect,
              score: latest.score,
              maxScore: latest.maxScore,
              explanation: parsed.data.explanation,
            };
          }
        }

        return (
          <QuizClient
            id={id}
            config={sanitized}
            initialState={initialState}
            presentation={presentation}
            draftStorageKey={draftStoragePrefix ? `${draftStoragePrefix}:${id}` : undefined}
          />
        );
      }
    } catch {
      // Ignore DB lookup error in preview / pending states
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
