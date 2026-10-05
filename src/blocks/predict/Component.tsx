import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { sanitizeBlockConfig } from "@/mdx/sanitize";
import { PredictConfigSchema, type SanitizedPredictConfig } from "./schema";
import { PredictClient, type PredictInitialState } from "./PredictClient";
import { getLatestBlockResponse } from "@/server/progress/latest-response";
import { PendingBlockCard } from "@/components/learn/pending-block-card";

export type PredictOptionInput = string | { id?: string; label: string };

export async function PredictComponent({
  id,
  prompt,
  options,
  explanation,
  allowRetry = true,
  context,
}: {
  id?: string;
  prompt?: string;
  options?: PredictOptionInput[];
  explanation?: string;
  allowRetry?: boolean;
  context?: {
    method?: string;
    url?: string;
    bearer?: string;
    responseHint?: string;
  };
}) {
  // Direct prop authoring fallback
  if (prompt && Array.isArray(options) && options.length >= 2) {
    const normalizedOptions = options.map((opt, i) =>
      typeof opt === "string"
        ? { id: `opt-${i}`, label: opt }
        : { id: opt.id || `opt-${i}`, label: opt.label || "" }
    );

    const clientConfig: SanitizedPredictConfig = {
      prompt,
      options: normalizedOptions,
      explanation,
      allowRetry,
      context,
    };

    return (
      <PredictClient
        id={id || "preview-predict"}
        config={clientConfig}
        initialState={null}
      />
    );
  }

  if (id) {
    try {
      const block = await prisma.block.findUnique({ where: { id } });
      const parsed = block ? PredictConfigSchema.safeParse(block.config) : null;
      if (block && block.type === "PREDICT" && parsed?.success) {
        const sanitized = sanitizeBlockConfig<typeof parsed.data, SanitizedPredictConfig>(parsed.data);
        const user = await getSessionUser();
        let initialState: PredictInitialState | null = null;
        if (user) {
          const latest = await getLatestBlockResponse(id, user.id);
          if (latest) {
            const selected =
              typeof (latest.payload as { selected?: unknown } | null)?.selected === "string"
                ? (latest.payload as { selected: string }).selected
                : "";
            initialState = {
              selected,
              isCorrect: latest.isCorrect,
              score: latest.score,
              maxScore: latest.maxScore,
              explanation: parsed.data.explanation,
            };
          }
        }

        return <PredictClient id={id} config={sanitized} initialState={initialState} />;
      }
    } catch {
      // Ignore DB lookup error in preview / pending states
    }
  }

  // Graceful pending state
  if (id || prompt) {
    return (
      <PendingBlockCard
        typeLabel="Prediction Challenge"
        title={prompt || "Prediction challenge in progress"}
        description="Predict-the-output challenge is being prepared for this section."
        blockId={id}
      />
    );
  }

  return null;
}
