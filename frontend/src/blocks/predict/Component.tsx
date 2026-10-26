import { fetchBlockState } from "@/blocks/block-state";
import type { SanitizedPredictConfig } from "@/shared/blocks/predict/schema";
import { PredictClient } from "./PredictClient";
import { PendingBlockCard } from "@buildment/learning-ui/components/learn/pending-block-card";

export type PredictOptionInput = string | { id?: string; label: string };

export async function PredictComponent({
  id,
  prompt,
  options,
  explanation,
  allowRetry = true,
  context,
  correctOptionId,
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
  correctOptionId?: string;
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
        correctOptionId={correctOptionId}
      />
    );
  }

  if (id) {
    const state = await fetchBlockState(id, "PREDICT");
    if (state) return <PredictClient id={id} config={state.config} initialState={state.initialState} />;
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
