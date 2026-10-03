import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { getLatestBlockResponse } from "@/server/progress/latest-response";
import { sanitizeBlockConfig } from "@/mdx/sanitize";
import { CodeConfigSchema, type SanitizedCodeConfig } from "./schema";
import { CodeExerciseClient, type CodeInitialState } from "./CodeExerciseClient";

export async function CodeExerciseComponent({ id }: { id: string }) {
  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? CodeConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "CODE" || !parsed?.success) {
    return (
      <div className="not-prose my-6 rounded-md border border-dashed border-destructive/50 p-4 text-sm text-destructive">
        Code exercise block {id} is missing or misconfigured.
      </div>
    );
  }

  const user = await getSessionUser();
  let initialState: CodeInitialState | null = null;
  if (user) {
    const latest = await getLatestBlockResponse(id, user.id);
    if (latest) {
      initialState = {
        source: typeof (latest.payload as { source?: unknown }).source === "string"
          ? (latest.payload as { source: string }).source
          : parsed.data.starterCode,
        isCorrect: latest.isCorrect,
      };
    }
  }

  return (
    <CodeExerciseClient
      id={id}
      config={sanitizeBlockConfig<typeof parsed.data, SanitizedCodeConfig>(parsed.data)}
      initialState={initialState}
    />
  );
}
