import { prisma } from "@/server/db";
import { getSessionUser } from "@/server/auth/guards";
import { CodeConfigSchema, type SanitizedCodeConfig } from "./schema";
import { CodeExerciseClient, type CodeInitialState } from "./CodeExerciseClient";
import { getLatestBlockResponse } from "@/server/progress/latest-response";

export async function CodeExerciseComponent({ id }: { id: string }) {
  const block = await prisma.block.findUnique({ where: { id } });
  const parsed = block ? CodeConfigSchema.safeParse(block.config) : null;
  if (!block || block.type !== "CODE" || !parsed?.success) {
    return (
      <div className="my-6 rounded-md border border-dashed border-destructive/50 p-4 text-sm text-destructive">
        Code exercise {id} is missing or misconfigured.
      </div>
    );
  }

  const { tests, solution, ...rest } = parsed.data;
  const clientConfig: SanitizedCodeConfig = {
    ...rest,
    testCount: tests.length,
  };

  const user = await getSessionUser();
  let initialState: CodeInitialState | null = null;
  if (user) {
    const latest = await getLatestBlockResponse(id, user.id);
    if (latest) {
      const source =
        typeof (latest.payload as { source?: unknown } | null)?.source === "string"
          ? (latest.payload as { source: string }).source
          : parsed.data.starterCode;
      initialState = {
        source,
        isCorrect: latest.isCorrect,
        explanation: parsed.data.explanation,
        solution: latest.isCorrect ? parsed.data.solution : undefined,
      };
    }
  }

  return <CodeExerciseClient id={id} config={clientConfig} initialState={initialState} />;
}
