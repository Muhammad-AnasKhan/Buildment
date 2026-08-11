import { prisma } from "@/server/db";
import { CodeConfigSchema, type SanitizedCodeConfig } from "./schema";
import { CodeExerciseClient } from "./CodeExerciseClient";

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

  return <CodeExerciseClient id={id} config={clientConfig} />;
}
