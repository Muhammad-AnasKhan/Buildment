import { prisma } from "@/server/db";
import { sanitizeBlockConfig } from "@/mdx/sanitize";
import { PredictConfigSchema, type SanitizedPredictConfig } from "./schema";
import { PredictClient } from "./PredictClient";

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

  return <PredictClient id={id} config={sanitized} />;
}
