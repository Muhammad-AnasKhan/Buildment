import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { sanitizeBlockConfig } from "@/mdx/sanitize";
import { PredictConfigSchema, type SanitizedPredictConfig } from "./schema";
import { PredictClient, type PredictInitialState } from "./PredictClient";
import { getLatestBlockResponse } from "@/server/progress/latest-response";

export async function PredictComponent({ id }: { id: string }) {
  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? PredictConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "PREDICT" || !parsed?.success) {
    return (
      <div className="my-6 rounded-md border border-dashed border-destructive/50 p-4 text-sm text-destructive">
        Predict block {id} is missing or misconfigured.
      </div>
    );
  }

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
